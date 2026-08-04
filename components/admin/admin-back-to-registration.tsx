import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  className?: string;
};

export function AdminBackToRegistration({ className }: Props) {
  return (
    <Link
      href="/registration"
      className={
        className ??
        'inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
      }
    >
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
      Voltar à inscrição
    </Link>
  );
}
