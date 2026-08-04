import Link from 'next/link';
import { Heart, Lock, Sparkles } from 'lucide-react';

type RegistrationClosedProps = {
  variant?: 'card' | 'banner' | 'compact';
  showHomeLink?: boolean;
};

export function RegistrationClosed({
  variant = 'card',
  showHomeLink = true,
}: RegistrationClosedProps) {
  if (variant === 'banner') {
    return (
      <div
        role="status"
        className="w-full bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border-b border-primary/20 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Lock className="h-4 w-4" />
          </span>
          <p className="text-sm sm:text-base font-medium text-foreground">
            <span className="text-primary font-semibold">Inscrições encerradas</span>
            {' — '}
            as vagas para o IPVO Acampa Jovens já foram preenchidas.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        role="status"
        className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm"
      >
        <Lock className="h-4 w-4 text-primary shrink-0" />
        <span>Inscrições encerradas</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 text-center"
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Heart className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Obrigado pelo interesse!
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Ficamos muito felizes com a procura — as vagas para o{' '}
            <span className="font-medium text-foreground">IPVO Acampa Jovens</span>{' '}
            já foram preenchidas e as inscrições estão encerradas.
          </p>
        </div>

        <div className="flex items-start justify-center gap-2 rounded-xl bg-secondary/60 border border-border/60 px-4 py-3 text-left max-w-md mx-auto">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Fique de olho nas nossas redes e no site para as próximas edições.
            Se tiver alguma dúvida, nossa equipe está à disposição para ajudar.
          </p>
        </div>
      </div>
    </div>
  );
}
