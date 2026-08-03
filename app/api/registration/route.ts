import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { RegistrationFormData } from '@/shared/registration.interface';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { RegistrationModel } from '@/shared/models/registration.model';
import { isRegistrationOpen } from '@/lib/registration-config';

dotenv.config();

export async function POST(req: NextRequest) {
  if (!isRegistrationOpen()) {
    return NextResponse.json(
      { error: 'Inscrições encerradas.' },
      { status: 403 },
    );
  }

  console.log('Registration API called');

  await connectToDatabase();
  console.log('Database connected');

  try {
    const formData: RegistrationFormData = await req.json();
    console.log('Received registration data:', {
      name: formData.name,
      identityDocument: formData.identityDocument,
      hasPayment: !!formData.payment,
      paymentReferenceId: formData.payment?.referenceId,
      isSuite: formData.isSuiteRegistration,
    });

    if (
      !formData.name ||
      !formData.responsibleInfo.name ||
      !formData.responsibleInfo.document ||
      !formData.responsibleInfo.phone
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    let mainRegistration = await RegistrationModel.findOneAndUpdate(
      { 'payment.referenceId': formData.payment?.referenceId },
      { $set: formData },
      { returnDocument: 'after', upsert: true },
    );

    if (formData.isSuiteRegistration && formData.suitePartner) {
      const partnerData = {
        ...formData.suitePartner,
        payment: {
          ...formData.suitePartner.payment,
          referenceId:
            formData.suitePartner.payment?.referenceId ||
            formData.payment.referenceId + '-P2',
        },
        isSuiteRegistration: true,
        suitePartnerId: mainRegistration._id,
      };

      let partnerRegistration = await RegistrationModel.findOneAndUpdate(
        { 'payment.referenceId': partnerData.payment.referenceId },
        { $set: partnerData },
        { returnDocument: 'after', upsert: true },
      );

      await RegistrationModel.findByIdAndUpdate(mainRegistration._id, {
        suitePartnerId: partnerRegistration._id,
        suitePartnerName: partnerData.name,
      });

      console.log('Suite partner registration saved');
    }

    return NextResponse.json({
      message: 'Registration saved successfully',
      referenceId: mainRegistration.payment.referenceId,
    });
  } catch (error) {
    console.error('Error in /api/registration:', error);
    return NextResponse.json(
      { error: 'Failed to save data to MongoDB' },
      { status: 500 },
    );
  }
}
