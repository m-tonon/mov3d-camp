'use client';

import { useState } from 'react';
import { RegistrationFormData } from '@/shared/registration.interface';
import { createPaymentLink } from '@/services/payment';
import { areInstallmentsAvailable } from '@/lib/registration-config';
import { Tag, Check, Loader2, X } from 'lucide-react';

interface Props {
  data: RegistrationFormData;
  onBack: () => void;
}

import { ORIGENS, PRICING } from '@/lib/event-config';

interface CouponValidationResponse {
  valid: boolean;
  discountPercentage?: number;
  usageLimit?: number | null;
  usageCount?: number;
  error?: string;
}

export function PaymentSection({ data, onBack }: Props) {
  const installmentsAvailable = areInstallmentsAvailable();
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponValid, setCouponValid] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const baseAmount = data.payment?.amount ?? PRICING.alojamentoFull;
  const discountAmount = couponValid && couponDiscount > 0
    ? Math.round(baseAmount * (couponDiscount / 100))
    : 0;
  const finalAmount = baseAmount - discountAmount;
  const formattedBase = (baseAmount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const formattedFinal = (finalAmount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const validateCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
      const data: CouponValidationResponse = await res.json();

      if (data.valid) {
        setCouponValid(true);
        setCouponDiscount(data.discountPercentage || 0);
        setCouponError('');
      } else {
        setCouponValid(false);
        setCouponDiscount(0);
        setCouponError(data.error || 'Cupom inválido');
      }
    } catch {
      setCouponValid(false);
      setCouponDiscount(0);
      setCouponError('Erro ao validar cupom');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCouponCode(value);
    if (couponValid) {
      setCouponValid(false);
      setCouponDiscount(0);
      setCouponError('');
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await createPaymentLink(data.payment, couponValid ? couponCode : undefined);
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
          {couponValid && couponDiscount > 0 ? (
            <>
              <p className="text-2xl font-medium text-muted-foreground line-through">
                {formattedBase}
              </p>
              <p className="text-4xl font-black tracking-tight text-green-500">
                {formattedFinal}
              </p>
              <p className="text-sm font-semibold text-green-500 flex items-center justify-center gap-1">
                <Tag className="w-4 h-4" />
                Desconto de {couponDiscount}% aplicado
              </p>
            </>
          ) : (
            <p className="text-4xl font-black tracking-tight text-foreground">
              {formattedBase}
            </p>
          )}
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

      {/* Coupon input */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Cupom de Desconto
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o código do cupom"
            value={couponCode}
            onChange={handleCouponChange}
            onBlur={validateCoupon}
            onKeyDown={(e) => {
              if (e.key === 'Enter') validateCoupon();
            }}
            className={`flex-1 bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/45 text-uppercase ${
              couponValid
                ? 'border-green-500/50 bg-green-500/5'
                : couponError
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-border'
            }`}
            disabled={couponValid || validatingCoupon}
            maxLength={20}
          />
          {couponValid ? (
            <button
              type="button"
              onClick={() => {
                setCouponCode('');
                setCouponValid(false);
                setCouponDiscount(0);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
              Remover
            </button>
          ) : validatingCoupon ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary flex-shrink-0" />
          ) : (
            <button
              type="button"
              onClick={validateCoupon}
              disabled={!couponCode.trim() || validatingCoupon}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              Aplicar
            </button>
          )}
        </div>

        {couponError && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {couponError}
          </p>
        )}

        {couponValid && couponDiscount > 0 && (
          <div className="flex items-center justify-between text-xs text-green-500 bg-green-500/10 rounded-lg px-3 py-2">
            <span>Desconto de {couponDiscount}% aplicado</span>
            <span className="font-mono">
              -{(discountAmount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
        )}
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

import { AlertTriangle } from 'lucide-react';