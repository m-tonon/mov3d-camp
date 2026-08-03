"use client";

import { useState } from "react";
import { RegistrationFormData } from "@/shared/registration.interface";
import { createPaymentLink } from "@/services/payment";

interface Props {
  data: RegistrationFormData;
}

export function RegistrationSuccess({ data }: Props) {
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await createPaymentLink(data.payment);
      setPaymentLink(response.paymentLink);
    } catch {
      setError("Erro ao gerar o link. Tente novamente ou entre em contato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        {/* Success card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

          <div className="p-8 text-center space-y-5">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold">Inscrição registrada!</h2>
              <p className="text-sm text-muted-foreground">
                Dados de{" "}
                <strong className="text-foreground font-semibold">
                  {data.name}
                </strong>{" "}
                salvos com sucesso.
              </p>
            </div>

            {/* Info box */}
            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 text-sm">
              <InfoRow label="Nome" value={data.name} />
              {data.age && <InfoRow label="Idade" value={`${data.age} anos`} />}
              <InfoRow label="Responsável" value={data.responsibleInfo.name} />
              <InfoRow
                label="Contato"
                value={data.responsibleInfo.email}
                mono
              />
              {data.payment.referenceId && (
                <InfoRow
                  label="Referência"
                  value={data.payment.referenceId}
                  mono
                />
              )}
            </div>

            {/* CTA */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {paymentLink ? (
              <div className="space-y-3">
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-600 text-white text-sm font-semibold transition-all hover:bg-green-700 active:scale-[0.98] shadow-sm"
                >
                  Pagar agora
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
                <p className="text-xs text-muted-foreground">
                  O link acima abrirá a página segura de pagamento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Gerando link...
                    </span>
                  ) : (
                    "Gerar link de pagamento"
                  )}
                </button>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <span>💳</span>
                  <span>PIX · Cartão de crédito · Débito · 10x</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning note */}
        <div className="flex gap-2.5 items-start bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
          <span className="text-base flex-shrink-0">⚠️</span>
          <span>
            Sua vaga só é garantida após a{" "}
            <strong>confirmação do pagamento</strong>. Finalize o quanto antes
            para não perder a vaga.
          </span>
        </div>

        {/* Contacts */}
        <div className="bg-card border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground space-y-1 pb-2">
          <p className="font-medium text-foreground mb-1.5">Dúvidas?</p>
          <p>📞 Secretaria IPVO · (44) 3226-4473</p>
          <p>📱 Ana Carla · (44) 9 9115-8078</p>
          <p className="text-xs text-muted-foreground pt-2">
            Ou entre em contato com a secretaria da sua igreja.
          </p>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
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
        className={`text-foreground text-right truncate ${mono ? "font-mono text-xs" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
