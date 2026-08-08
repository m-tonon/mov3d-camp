import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { adminDeleteRegistration } from '@/lib/suite-partner-cleanup';

const ADMIN_PASS = process.env.ADMIN_PASS!;

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { id, password } = await req.json();

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

    const result = await adminDeleteRegistration(id);

    if (result === 'not_found') {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 },
      );
    }

    if (result === 'paid') {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir inscrição com pagamento confirmado. Marque como pendente antes, se necessário.',
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inscrição excluída com sucesso',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao excluir inscrição';
    console.error('Error deleting registration:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
