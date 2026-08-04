import { NextRequest, NextResponse } from 'next/server';
import { RegistrationFormData } from '@/shared/registration.interface';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { RegistrationModel } from '@/shared/models/registration.model';
import { isRegistrationOpen } from '@/lib/registration-config';
import { normalizeCpf } from '@/lib/cpf';
import { upsertRegistrationByCpf } from '@/lib/registration-persist';
import { validateShirtForSave } from '@/lib/shirt-lines';
import {
  dissolveSuitePartnerForIndividualMain,
  reconcileStaleSuitePartnerRef,
  removeReplacedSuitePartner,
} from '@/lib/suite-partner-cleanup';

const PAID_CPF_MESSAGE =
  'Já existe uma inscrição com pagamento confirmado para este CPF. Se precisar de ajuda, fale com a organização.';

export async function POST(req: NextRequest) {
  if (!isRegistrationOpen()) {
    return NextResponse.json(
      { error: 'Inscrições encerradas.' },
      { status: 403 },
    );
  }

  await connectToDatabase();

  try {
    const formData: RegistrationFormData = await req.json();

    if (
      !formData.name ||
      !formData.cpf ||
      !formData.whatsapp ||
      !formData.email ||
      !formData.stay?.accommodationType
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const needsResponsible =
      (formData.age !== null &&
        formData.age >= 16 &&
        formData.age < 18) ||
      (formData.isSuiteRegistration &&
        formData.suitePartner?.age !== null &&
        formData.suitePartner.age >= 16 &&
        formData.suitePartner.age < 18);

    if (
      needsResponsible &&
      (!formData.responsibleInfo?.name ||
        !formData.responsibleInfo?.document ||
        !formData.responsibleInfo?.phone ||
        !formData.responsibleInfo?.email)
    ) {
      return NextResponse.json(
        { error: 'Missing responsible fields' },
        { status: 400 },
      );
    }

    if (!validateShirtForSave(formData.shirt)) {
      return NextResponse.json(
        { error: 'Informe modelo, tamanho e quantidade da camiseta.' },
        { status: 400 },
      );
    }

    const mainResult = await upsertRegistrationByCpf(formData);
    if (!mainResult.ok) {
      return NextResponse.json({ error: PAID_CPF_MESSAGE }, { status: 409 });
    }
    const mainRegistration = mainResult.doc;

    if (!formData.isSuiteRegistration) {
      await dissolveSuitePartnerForIndividualMain(mainRegistration._id);
    } else if (formData.suitePartner) {
      const previousPartnerId = (
        await RegistrationModel.findById(mainRegistration._id).select(
          'suitePartnerId',
        )
      )?.suitePartnerId;

      const mainCpf = normalizeCpf(formData.cpf);
      const partnerCpf = normalizeCpf(formData.suitePartner.cpf);
      if (mainCpf.length === 11 && mainCpf === partnerCpf) {
        return NextResponse.json(
          { error: 'O CPF do cônjuge deve ser diferente do acampante.' },
          { status: 400 },
        );
      }

      const partnerPayload: RegistrationFormData = {
        ...formData.suitePartner,
        stay: formData.stay,
        payment: {
          ...formData.suitePartner.payment,
          referenceId:
            formData.suitePartner.payment?.referenceId ||
            `${formData.payment.referenceId}-P2`,
        },
        isSuiteRegistration: true,
      };

      const partnerResult = await upsertRegistrationByCpf(partnerPayload);
      if (!partnerResult.ok) {
        return NextResponse.json({ error: PAID_CPF_MESSAGE }, { status: 409 });
      }
      const partnerRegistration = partnerResult.doc;

      await RegistrationModel.findByIdAndUpdate(mainRegistration._id, {
        suitePartnerId: partnerRegistration._id,
        suitePartnerName: partnerRegistration.name,
        isSuiteRegistration: true,
      });

      await RegistrationModel.findByIdAndUpdate(partnerRegistration._id, {
        suitePartnerId: mainRegistration._id,
        isSuiteRegistration: true,
      });

      await removeReplacedSuitePartner(
        previousPartnerId,
        partnerRegistration._id,
      );
    }

    await reconcileStaleSuitePartnerRef(mainRegistration._id);

    const refreshed = await RegistrationModel.findById(mainRegistration._id);

    return NextResponse.json({
      message: 'Registration saved successfully',
      referenceId: refreshed?.payment?.referenceId ?? formData.payment.referenceId,
    });
  } catch (error) {
    console.error('Error in /api/registration:', error);
    return NextResponse.json(
      { error: 'Failed to save data to MongoDB' },
      { status: 500 },
    );
  }
}
