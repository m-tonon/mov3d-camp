import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { RegistrationModel } from '@/shared/models/registration.model';

const ADMIN_PASS = process.env.ADMIN_PASS!;

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { id, password, confirmed } = await req.json();

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID e senha são obrigatórios' },
        { status: 400 },
      );
    }

    if (password !== ADMIN_PASS) {
      return NextResponse.json(
        { error: 'Senha de autorização inválida' },
        { status: 401 },
      );
    }

    const targetStatus = confirmed !== false;

    const mainRegistration = await RegistrationModel.findByIdAndUpdate(
      id,
      { $set: { 'payment.paymentConfirmed': targetStatus } },
      { returnDocument: 'after' },
    );

    if (!mainRegistration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 },
      );
    }

    if (
      mainRegistration.isSuiteRegistration &&
      mainRegistration.suitePartnerId
    ) {
      const partnerUpdate: Record<string, unknown> = {
        'payment.paymentConfirmed': targetStatus,
      };
      if (mainRegistration.payment?.referenceId) {
        partnerUpdate['payment.referenceId'] = mainRegistration.payment.referenceId;
        partnerUpdate['payment.paymentLink'] = mainRegistration.payment.paymentLink ?? '';
        partnerUpdate['payment.amount'] = 0;
      }
      await RegistrationModel.findByIdAndUpdate(mainRegistration.suitePartnerId, {
        $set: partnerUpdate,
      });
    }

    return NextResponse.json({
      success: true,
      message: targetStatus
        ? 'Inscrição confirmada com sucesso'
        : 'Inscrição marcada como pendente com sucesso',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar status da inscrição';
    console.error('Error updating registration payment status manually:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
