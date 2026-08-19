import { NextRequest, NextResponse } from 'next/server';
import { isRegistrationOpen, areInstallmentsAvailable } from '@/lib/registration-config';
import { ORIGENS, PRICING } from '@/lib/event-config';

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN!;
const PAGBANK_API_URL = process.env.PAGBANK_API_URL!;
const DOMAIN_URL = process.env.DOMAIN_URL!;

type PagBankCheckoutResponse = {
  id?: string;
  reference_id?: string;
  links?: { rel: string; href: string }[];
};

export async function POST(req: NextRequest) {
  try {
    const payment = await req.json();
    console.log('Incoming payment:', payment);

    if (!isRegistrationOpen()) {
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
    const maxInstallments = String(
      payment.maxInstallments ?? PRICING.maxInstallments,
    );
    const publicInstallmentsLimit = areInstallmentsAvailable()
      ? maxInstallments
      : '1';

    const paymentMethodsConfigs = [
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
          name: `Inscrição ${ORIGENS.title}`,
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
      notification_urls: [`https://${DOMAIN_URL}/api/payment/webhook`],
    };

    console.log('Request options to PagBank:', payload);

    const checkoutUrl = new URL('/checkouts', PAGBANK_API_URL);

    const response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const pagbankData = (await response.json().catch(() => undefined)) as
      | PagBankCheckoutResponse
      | undefined;

    if (!response.ok || !pagbankData) {
      console.error(
        'Error in /api/payments/checkout:',
        pagbankData ?? response.statusText,
      );
      return NextResponse.json({ error: 'Payment error' }, { status: 500 });
    }

    const paymentLink =
      pagbankData.links?.find((l) => l.rel === 'PAY')?.href ?? null;

    return NextResponse.json({
      paymentLink,
      referenceId: pagbankData.reference_id,
      checkoutId: pagbankData.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Payment error';
    console.error('Error in /api/payments/checkout:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
