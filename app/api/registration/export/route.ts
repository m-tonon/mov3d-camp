import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose-connection';
import { RegistrationModel } from '@/shared/models/registration.model';
import { Parser } from 'json2csv';
import { formatShirtItemsSummary, totalShirtUnits } from '@/lib/shirt-lines';
import {
  formatExportDateTime,
  formatPaymentAmountBrl,
  formatStayDaysLabel,
  needsCribLabel,
  parentalAuthorizationLabel,
  simNao,
} from '@/lib/export-report-format';

function accommodationLabel(r: {
  stay?: { accommodationType?: string };
  isSuiteRegistration?: boolean;
}): string {
  const fromStay = r.stay?.accommodationType;
  if (fromStay) return fromStay;
  if (r.isSuiteRegistration) return 'Suíte';
  return '';
}

function mapRegistrationRow(r: Record<string, unknown>) {
  const accommodation = accommodationLabel(r as Parameters<typeof accommodationLabel>[0]);
  const bringingChildren = (r.stay as { bringingChildren?: boolean } | undefined)
    ?.bringingChildren;

  return {
    name: r.name,
    birthDate: r.birthDate,
    age: r.age,
    gender: r.gender,
    cpf: r.cpf,
    whatsapp: r.whatsapp,
    email: r.email,
    churchMembership: r.churchMembership,
    churchName: r.churchName,
    attendedPreviousIpvoCamps: r.attendedPreviousIpvoCamps,
    hasHealthPlan: r.hasHealthPlan,
    healthPlanName: r.healthPlanName,
    allergies: r.allergies,
    shirtWants: (r.shirt as { wantsShirt?: boolean } | undefined)?.wantsShirt,
    shirtTotalQuantity: totalShirtUnits(r.shirt as Parameters<typeof totalShirtUnits>[0]),
    shirtSummary: formatShirtItemsSummary(r.shirt as Parameters<typeof formatShirtItemsSummary>[0]),
    accommodationType: accommodation,
    stayDays: (r.stay as { stayDays?: string } | undefined)?.stayDays,
    bringingChildren,
    childrenDetails: (r.stay as { childrenDetails?: string } | undefined)?.childrenDetails,
    needsCrib: (r.stay as { needsCrib?: boolean } | undefined)?.needsCrib,
    responsibleName: (r.responsibleInfo as { name?: string } | undefined)?.name,
    responsiblePhone: (r.responsibleInfo as { phone?: string } | undefined)?.phone,
    responsibleRelation: (r.responsibleInfo as { relation?: string } | undefined)?.relation,
    responsibleDocument: (r.responsibleInfo as { document?: string } | undefined)?.document,
    responsibleEmail: (r.responsibleInfo as { email?: string } | undefined)?.email,
    parentalAuthorization: r.parentalAuthorization,
    paymentReferenceId: (r.payment as { referenceId?: string } | undefined)?.referenceId,
    paymentAmount: (r.payment as { amount?: number } | undefined)?.amount,
    paymentConfirmed: (r.payment as { paymentConfirmed?: boolean } | undefined)?.paymentConfirmed,
    responsibleInfo: r.responsibleInfo,
    payment: r.payment,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    _id: r._id,
  };
}

function mapRegistrationRowForCsv(row: ReturnType<typeof mapRegistrationRow>) {
  const age = typeof row.age === 'number' ? row.age : null;
  const bringingChildrenBool = row.bringingChildren as boolean | undefined;
  const needsCribBool = row.needsCrib as boolean | undefined;

  return {
    ...row,
    shirtWants: simNao(row.shirtWants as boolean | undefined),
    stayDays: formatStayDaysLabel(row.stayDays as string | undefined),
    bringingChildren: simNao(bringingChildrenBool),
    needsCrib: needsCribLabel(
      row.accommodationType as string | undefined,
      bringingChildrenBool,
      needsCribBool,
    ),
    parentalAuthorization: parentalAuthorizationLabel(
      age,
      row.parentalAuthorization as boolean | undefined,
    ),
    paymentAmount: formatPaymentAmountBrl(row.paymentAmount as number | undefined),
    paymentConfirmed: simNao(row.paymentConfirmed),
    createdAt: formatExportDateTime(row.createdAt as string | Date),
    updatedAt: formatExportDateTime(row.updatedAt as string | Date),
  };
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = req.nextUrl;
    const paymentOnly = searchParams.get('paid') === 'true';
    const csvMode = searchParams.get('csv') === '1';

    const query = paymentOnly ? { 'payment.paymentConfirmed': true } : {};
    const registrations = await RegistrationModel.find(query).lean();

    const flat = registrations.map((r) => mapRegistrationRow(r as Record<string, unknown>));

    if (csvMode) {
      const fields = [
        { label: 'Nome do Acampante', value: 'name' },
        { label: 'Data de Nascimento', value: 'birthDate' },
        { label: 'Idade', value: 'age' },
        { label: 'Gênero', value: 'gender' },
        { label: 'CPF', value: 'cpf' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'E-mail', value: 'email' },
        { label: 'Membro de Igreja', value: 'churchMembership' },
        { label: 'Nome da Igreja', value: 'churchName' },
        {
          label: 'Já foi em acampamentos IPVO',
          value: 'attendedPreviousIpvoCamps',
        },
        { label: 'Possui plano de saúde', value: 'hasHealthPlan' },
        { label: 'Plano de saúde', value: 'healthPlanName' },
        { label: 'Alergias / saúde', value: 'allergies' },
        { label: 'Camiseta', value: 'shirtWants' },
        { label: 'Qtd. camisetas', value: 'shirtTotalQuantity' },
        { label: 'Camisetas (detalhe)', value: 'shirtSummary' },
        { label: 'Dormitório', value: 'accommodationType' },
        { label: 'Dias no acampamento', value: 'stayDays' },
        { label: 'Leva filhos', value: 'bringingChildren' },
        { label: 'Filhos (qtd/idades)', value: 'childrenDetails' },
        { label: 'Berço (suíte)', value: 'needsCrib' },
        { label: 'Nome do Responsável', value: 'responsibleName' },
        { label: 'Telefone do Responsável', value: 'responsiblePhone' },
        { label: 'Relação com o Acampante', value: 'responsibleRelation' },
        { label: 'Documento do Responsável', value: 'responsibleDocument' },
        { label: 'Email do Responsável', value: 'responsibleEmail' },
        { label: 'Autorização dos Pais', value: 'parentalAuthorization' },
        { label: 'ID do Pagamento', value: 'paymentReferenceId' },
        { label: 'Valor', value: 'paymentAmount' },
        { label: 'Pagamento Confirmado', value: 'paymentConfirmed' },
        { label: 'Criado em', value: 'createdAt' },
        { label: 'Atualizado em', value: 'updatedAt' },
      ];

      const csvRows = flat.map(mapRegistrationRowForCsv);
      const csv = new Parser({ fields }).parse(csvRows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition':
            'attachment; filename="origens-inscricoes2027.csv"',
        },
      });
    }

    return NextResponse.json(flat);
  } catch (error) {
    console.error('Error in /api/registration/export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
