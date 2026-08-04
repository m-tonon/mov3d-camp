'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  MessageCircle,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { ORIGENS, PRICING, STAY_DAYS_HELP, CAMP_HEADER_IMAGE } from '@/lib/event-config';
import { formatBrlFromCents } from '@/lib/pricing';

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ORIGENS.mapsQuery)}`;
const churchMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ORIGENS.churchAddress)}`;
const whatsappUrl = `https://wa.me/55${ORIGENS.contact.phoneDigits}`;

function InfoTile({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-background/60 p-3.5 transition-colors duration-200">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground leading-snug">
          {children}
        </div>
      </div>
    </div>
  );
}

function IntroBlock({
  title,
  children,
  variant = 'default',
  id,
}: {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'social';
  id?: string;
}) {
  const shell =
    variant === 'social'
      ? 'rounded-2xl border border-border bg-muted/50 p-5 sm:p-6'
      : 'rounded-2xl border border-border bg-card/50 p-5 sm:p-6';

  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="pt-8 mt-8 border-t border-border first:mt-0 first:pt-0 first:border-t-0"
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4"
      >
        {title}
      </h2>
      <div className={`${shell} space-y-4`}>{children}</div>
    </section>
  );
}

function PriceRow({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/80 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {hint && (
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        )}
      </div>
      <p className="text-lg font-bold tabular-nums text-primary shrink-0">
        {value}
      </p>
    </div>
  );
}

export function RegistrationOrientations({ embedded }: { embedded?: boolean }) {
  return (
    <article
      className={`${embedded ? 'pb-4 sm:pb-6' : 'mb-8'}`}
      aria-labelledby="acampa-intro-title"
    >
      {/* Hero — self-contained card; image stays clear, effects only under the title */}
      <header className="mx-4 sm:mx-6 mt-4 sm:mt-5 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/12 via-background to-accent/10 shadow-sm">
        <div className="relative w-full aspect-[2.5/1] max-h-[220px] sm:max-h-[240px] overflow-hidden">
          <Image
            src={CAMP_HEADER_IMAGE}
            alt="Acampamento ORIGENS"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_48px_rgba(0,0,0,0.28)]"
            aria-hidden
          />
        </div>
        <div className="relative overflow-hidden px-5 py-8 sm:px-8 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-0 h-20 w-[90%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-6 bottom-0 z-0 h-24 w-24 rounded-full bg-accent/15 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Inscrição
            </p>
            <h1
              id="acampa-intro-title"
              className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl"
            >
              {ORIGENS.title}
            </h1>
            <p className="mt-4 max-w-md mx-auto text-sm text-foreground/80 leading-relaxed">
              Antes de preencher o formulário, leia com atenção todas as
              orientações abaixo.
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 text-sm leading-relaxed text-foreground/90 px-4 sm:px-6">
        <p>
          Que bom ter você por aqui, seja muito bem-vindo(a)! Somos o grupo de
          jovens da{' '}
          <span className="font-medium text-foreground">
            Igreja Presbiteriana da Vila Operária
          </span>{' '}
          e da{' '}
          <span className="font-medium text-foreground">
            Igreja Cristianismo Decidido
          </span>{' '}
          — ficaremos muito felizes com sua presença no acampamento.
        </p>
      </section>

      <div className="px-4 sm:px-6">
        <IntroBlock title="Acompanhe no Instagram" variant="social" id="origens-social">
        <div className="flex flex-col sm:flex-row gap-2">
          {ORIGENS.socialInstagram.map((profile) => (
            <Link
              key={profile.url}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 cursor-pointer transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Abrir Instagram ${profile.label} (${profile.handle}) em nova aba`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white">
                <Instagram className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-left leading-tight">
                <span className="block text-xs font-medium text-foreground truncate">
                  {profile.label}
                </span>
                <span className="block text-xs text-primary truncate">
                  {profile.handle}
                </span>
              </span>
              <ExternalLink
                className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </IntroBlock>

      <IntroBlock title="Informações do acampamento" id="origens-event">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          aria-label="Detalhes do evento"
        >
          <InfoTile icon={CalendarDays} label="Data">
            {ORIGENS.datesLabel}
          </InfoTile>
          <InfoTile icon={Users} label="Idade mínima">
            A partir de {ORIGENS.minAge} anos
          </InfoTile>
          <InfoTile icon={MapPin} label="Local">
            <span className="block">{ORIGENS.venue}</span>
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              Ver no mapa
              <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          </InfoTile>
          <InfoTile icon={Clock} label="Horários">
            <span className="block">Chegada: {ORIGENS.arrival}</span>
            <span className="block text-muted-foreground font-normal">
              Saída: {ORIGENS.departure}
            </span>
          </InfoTile>
        </div>

        <p className="text-xs text-muted-foreground px-1">{ORIGENS.address}</p>

        <div className="flex gap-3 rounded-xl border border-border bg-muted/25 p-4">
          <UtensilsCrossed
            className="h-5 w-5 shrink-0 text-primary mt-0.5"
            aria-hidden
          />
          <div className="text-sm space-y-1">
            <p className="font-medium text-foreground">O que está incluso</p>
            <p className="text-muted-foreground leading-relaxed">
              Café da manhã, almoço, lanche e jantar. Cantina à disposição para
              bebidas, doces e outros itens.
            </p>
          </div>
        </div>
      </IntroBlock>

      <IntroBlock title="Valores e pagamento" id="origens-pricing">
        <div className="space-y-3">
          <PriceRow
            title="Alojamento"
            hint="Período completo (sexta à terça)"
            value={formatBrlFromCents(PRICING.alojamentoFull)}
          />
          <PriceRow
            title="Suíte"
            hint="Apenas casados · inscrição por pessoa"
            value={`${formatBrlFromCents(PRICING.suitePerPerson)} / pessoa`}
          />
          <PriceRow
            title="Diária"
            hint="1, 2 ou 3 dias completos (sáb–seg)"
            value={formatBrlFromCents(PRICING.dailyPerDay)}
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {STAY_DAYS_HELP}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Parcelamento em até {PRICING.maxInstallments}x no cartão. Pagamentos
          no crédito ou débito podem incluir taxas da operadora.
        </p>

        <div
          role="note"
          className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5"
        >
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-destructive mt-0.5"
            aria-hidden
          />
          <p className="text-sm text-foreground leading-relaxed">
            <strong className="font-semibold">
              Sua inscrição só será confirmada mediante pagamento.
            </strong>{' '}
            Vagas limitadas — não reservamos sem pagamento efetuado.
          </p>
        </div>
      </IntroBlock>

      <IntroBlock title="Dúvidas e contato" id="origens-contact">
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-base font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`Conversar no WhatsApp com ${ORIGENS.contact.name}`}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {ORIGENS.contact.name} · {ORIGENS.contact.phone}
        </Link>

        <footer className="space-y-2.5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          <p>
            <span className="font-semibold text-foreground">Igreja:</span>{' '}
            <Link
              href={churchMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              {ORIGENS.churchAddress}
            </Link>
          </p>
          <p>
            A programação será repassada pelo WhatsApp após a inscrição.
          </p>
        </footer>
      </IntroBlock>
      </div>
    </article>
  );
}
