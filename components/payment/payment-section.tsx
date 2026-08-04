'use client';

import { useState } from 'react';
import { RegistrationFormData } from '@/shared/registration.interface';
import { createPaymentLink } from '@/services/payment';
import { areInstallmentsAvailable } from '@/lib/registration-config';

interface Props {
  data: RegistrationFormData;
  onBack: () => void;
}

import { ORIGENS, PRICING } from '@/lib/event-config';

export function PaymentSection({ data, onBack }: Props) {
  const installmentsAvailable = areInstallmentsAvailable();
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = data.payment?.amount ?? PRICING.alojamentoFull;
  const formatted = (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await createPaymentLink(data.payment);
      setPaymentLink(response.paymentLink);
    } catch {
      setError(
        'Erro ao processar o pagamento. Alguns dados do responsável podem estar incorretos.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Amount card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        <div className="p-6 text-center space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Valor do investimento
          </p>
          <p className="text-4xl font-black tracking-tight text-foreground">
            {formatted}
          </p>
        </div>

        <div className="border-t border-border px-6 py-4 space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-muted-foreground flex-shrink-0 mt-0.5">
              💳
            </span>
            <span className="text-foreground/80">
              {['PIX', 'Cartão de Crédito', 'Cartão de Débito'].join(' · ')}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-muted-foreground flex-shrink-0 mt-0.5">
              🔒
            </span>
            <span className="text-foreground/80">
              Pagamento processado com segurança via{' '}
              <span className="font-medium text-foreground">PagSeguro</span>
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 mt-0.5">🔄</span>
            <span
              className={`${!installmentsAvailable ? 'line-through' : 'text-foreground/80'} `}
            >
              Parcelamento em até {PRICING.maxInstallments}x no cartão
            </span>
            {!installmentsAvailable && (
              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md no-underline not-line-through ml-1 self-start">
                indisponível
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Registration summary */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Resumo da inscrição
        </p>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Participante" value={data.name} />
          {data.age != null && (
            <SummaryRow label="Idade" value={`${data.age} anos`} />
          )}
          {data.stay?.accommodationType && (
            <SummaryRow
              label="Estadia"
              value={`${data.stay.accommodationType} · ${data.stay.stayDays === 'full' ? 'Período completo' : `${data.stay.stayDays} dia(s)`}`}
            />
          )}
          {data.payment?.name && (
            <SummaryRow label="Pagador" value={data.payment.name} />
          )}
          {data.payment?.email && (
            <SummaryRow label="E-mail" value={data.payment.email} mono />
          )}
          {data.payment?.referenceId && (
            <SummaryRow
              label="Referência"
              value={data.payment.referenceId}
              mono
            />
          )}
        </div>
      </div>

      {/* Payment action card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Pagamento via PagSeguro</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Você será redirecionado para a página segura do PagSeguro. Após
            concluir, feche a janela e retorne para confirmar.
          </p>
        </div>

        {error && (
          <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-3 text-xs text-destructive">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">
              Processando dados...
            </p>
          </div>
        ) : paymentLink ? (
          <button
            onClick={handleOpenPayment}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 text-white text-sm font-semibold transition-all hover:bg-green-700 active:scale-[0.98] shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Ir para pagamento
          </button>
        ) : (
          <button
            onClick={handleGenerateLink}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Gerar link de pagamento
          </button>
        )}

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground/70 hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          ← Voltar para inscrição
        </button>
      </div>

      {/* Warning */}
      <div className="flex gap-2.5 items-start bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
        <span className="flex-shrink-0">⚠️</span>
        <span>
          Sua vaga só é garantida após a{' '}
          <strong>confirmação do pagamento</strong>. Finalize o quanto antes.
        </span>
      </div>

      {/* Contacts */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground mb-1.5">Dúvidas?</p>
        <p>
          📞 {ORIGENS.contact.name} · {ORIGENS.contact.phone}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 items-baseline">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span
        className={`text-right truncate ${mono ? 'font-mono text-xs text-foreground/70' : 'font-medium text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
}
