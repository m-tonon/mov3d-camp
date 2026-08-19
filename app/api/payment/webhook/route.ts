import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { RegistrationModel } from '@/shared/models/registration.model';

type PagBankWebhookPayload = {
  reference_id?: string;
  status?: string;
  charges?: { reference_id?: string; status?: string }[];
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = (await req.json()) as PagBankWebhookPayload;
    const charge = body.charges?.find((item) => item.status === 'PAID');
    if (!charge && body.status !== 'PAID') {
      return NextResponse.json({
        message: 'No payment confirmation to process',
      });
    }

    const ids = [body.reference_id, charge?.reference_id].filter(
      (value): value is string => Boolean(value),
    );
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing referenceId' },
        { status: 400 },
      );
    }

    const mainRegistration = await RegistrationModel.findOneAndUpdate(
      { 'payment.referenceId': { $in: ids } },
      { $set: { 'payment.paymentConfirmed': true } },
      { returnDocument: 'after' },
    );

    if (!mainRegistration) {
      console.warn(
        `No registration found for referenceId: ${ids.join(', ')}`,
      );
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 },
      );
    }

    if (
      mainRegistration.isSuiteRegistration &&
      mainRegistration.suitePartnerId
    ) {
      const partnerUpdate: Record<string, unknown> = {
        'payment.paymentConfirmed': true,
      };
      if (mainRegistration.payment?.referenceId) {
        partnerUpdate['payment.referenceId'] =
          mainRegistration.payment.referenceId;
        partnerUpdate['payment.paymentLink'] =
          mainRegistration.payment.paymentLink ?? '';
        partnerUpdate['payment.amount'] = 0;
      }
      await RegistrationModel.findByIdAndUpdate(
        mainRegistration.suitePartnerId,
        { $set: partnerUpdate },
      );
    }

    return NextResponse.json({ message: 'Payment handled successfully' });
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    return NextResponse.json(
      { error: 'Error updating payment status' },
      { status: 500 },
    );
  }
}
