import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import dotenv from 'dotenv';
import { isRegistrationOpen, areInstallmentsAvailable } from '@/lib/registration-config';

dotenv.config();

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN!;
const PAGBANK_API_URL = process.env.PAGBANK_API_URL!;
const DOMAIN_URL = process.env.DOMAIN_URL!;

export async function POST(req: NextRequest) {
  try {
    const payment = await req.json();
    console.log('Incoming payment:', payment);

    if (!isRegistrationOpen() && payment.isStaffType !== true) {
      return NextResponse.json(
        { error: 'Inscrições encerradas.' },
        { status: 403 },
      );
    }

    if (!payment?.name || !payment?.cpf || !payment?.referenceId) {
      return NextResponse.json(
        { error: 'Missing payment info' },
        { status: 400 },
      );
    }

    const rawPhone = payment.phone?.replace(/\D/g, '');
    const area = rawPhone?.slice(0, 2) ?? null;
    const number = rawPhone?.slice(2) ?? null;

    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('Z', '-03:00');

    const amount = payment.amount ?? 28000;
    const isStaffType = payment.isStaffType === true;
    const maxInstallments = String(payment.maxInstallments ?? 10);
    const publicInstallmentsLimit = areInstallmentsAvailable()
      ? maxInstallments
      : '1';

    const paymentMethodsConfigs = isStaffType
      ? [
          {
            type: 'CREDIT_CARD',
            config_options: [
              { option: 'INSTALLMENTS_LIMIT', value: maxInstallments },
            ],
          },
        ]
      : [
          {
            type: 'credit_card',
            config_options: [
              { option: 'installments_limit', value: publicInstallmentsLimit },
            ],
          },
        ];

    const payload = {
      reference_id: payment.referenceId,
      expiration_date: expirationDate,
      customer: {
        name: payment.name,
        email: payment.email,
        tax_id: payment.cpf,
        phone: {
          country: '+55',
          area,
          number,
        },
      },
      customer_modifiable: true,
      items: [
        {
          name: isStaffType
            ? 'Acampa Deep Fake - Staff'
            : 'Acampa Deep Fake',
          quantity: 1,
          unit_amount: amount,
        },
      ],
      payment_methods: [
        { type: 'CREDIT_CARD' },
        { type: 'DEBIT_CARD' },
        { type: 'PIX' },
      ],
      payment_methods_configs: paymentMethodsConfigs,
      redirect_url: `https://${DOMAIN_URL}/registration?paymentCompleted=true`,
      return_url: `https://${DOMAIN_URL}/registration`,
    };

    console.log('Request options to PagBank:', payload);

    const pagbank = axios.create({
      baseURL: PAGBANK_API_URL,
      headers: {
        Authorization: `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const response = await pagbank.post('/checkouts', payload);

    const pagbankData = response.data;

    const paymentLink =
      pagbankData.links?.find((l: { rel: string }) => l.rel === 'PAY')?.href ??
      null;

    return NextResponse.json({
      paymentLink,
      referenceId: pagbankData.reference_id,
      checkoutId: pagbankData.id,
    });
  } catch (error: any) {
    console.error(
      'Error in /api/payments/checkout:',
      error.response?.data || error.message,
    );
    return NextResponse.json(
      { error: error.message || 'Payment error' },
      { status: 500 },
    );
  }
}
