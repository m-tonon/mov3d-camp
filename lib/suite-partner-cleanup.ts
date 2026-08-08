import type { Types } from 'mongoose';
import { RegistrationModel } from '@/shared/models/registration.model';

async function deleteUnpaidRegistrationIfExists(
  id: Types.ObjectId,
): Promise<void> {
  const doc = await RegistrationModel.findById(id);
  if (!doc || doc.payment?.paymentConfirmed) return;
  await RegistrationModel.findByIdAndDelete(id);
}

async function clearSuitePartnerFields(
  registrationId: Types.ObjectId,
): Promise<void> {
  await RegistrationModel.findByIdAndUpdate(registrationId, {
    $unset: {
      suitePartnerId: '',
      suitePartnerName: '',
      suitePartnerRegistrationNumber: '',
      suitePayerRegistrationNumber: '',
      suiteRole: '',
      suiteGroupNumber: '',
    },
    $set: { isSuiteRegistration: false },
  });
}

export async function reconcileStaleSuitePartnerRef(
  registrationId: Types.ObjectId,
): Promise<void> {
  const main = await RegistrationModel.findById(registrationId).select(
    'suitePartnerId',
  );
  if (!main?.suitePartnerId) return;

  const partnerExists = await RegistrationModel.exists({
    _id: main.suitePartnerId,
  });
  if (!partnerExists) {
    await clearSuitePartnerFields(registrationId);
  }
}

export async function dissolveSuitePartnerForIndividualMain(
  mainId: Types.ObjectId,
): Promise<void> {
  const main = await RegistrationModel.findById(mainId).select('suitePartnerId');
  if (!main) return;

  if (main.suitePartnerId) {
    const partner = await RegistrationModel.findById(main.suitePartnerId);
    if (partner?.payment?.paymentConfirmed) {
      await RegistrationModel.findByIdAndUpdate(partner._id, {
        $unset: {
          suitePartnerId: '',
          suitePayerRegistrationNumber: '',
          suitePartnerRegistrationNumber: '',
          suiteRole: '',
          suiteGroupNumber: '',
        },
        $set: { isSuiteRegistration: false },
      });
    } else {
      await deleteUnpaidRegistrationIfExists(main.suitePartnerId);
    }
  }

  await clearSuitePartnerFields(mainId);
}

export async function removeReplacedSuitePartner(
  previousPartnerId: Types.ObjectId | null | undefined,
  newPartnerId: Types.ObjectId,
): Promise<void> {
  if (!previousPartnerId) return;
  if (previousPartnerId.toString() === newPartnerId.toString()) return;
  await deleteUnpaidRegistrationIfExists(previousPartnerId);
}

export async function adminDeleteRegistration(
  id: Types.ObjectId,
): Promise<'deleted' | 'not_found' | 'paid'> {
  const reg = await RegistrationModel.findById(id);
  if (!reg) return 'not_found';
  if (reg.payment?.paymentConfirmed) return 'paid';

  const payerOfDeleted = await RegistrationModel.findOne({ suitePartnerId: id });
  if (payerOfDeleted) {
    await clearSuitePartnerFields(payerOfDeleted._id);
  }

  if (reg.suitePartnerId && reg.suiteRole !== 'partner') {
    const partner = await RegistrationModel.findById(reg.suitePartnerId);
    if (partner && !partner.payment?.paymentConfirmed) {
      await RegistrationModel.findByIdAndDelete(reg.suitePartnerId);
    } else if (partner) {
      await clearSuitePartnerFields(reg.suitePartnerId);
    }
  }

  await RegistrationModel.findByIdAndDelete(id);
  return 'deleted';
}
