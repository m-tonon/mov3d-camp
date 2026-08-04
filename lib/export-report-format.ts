const TZ = 'America/Sao_Paulo';

export function simNao(value: boolean | null | undefined): string {
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  return '';
}

export function naoAplicavelOuSimNao(
  applicable: boolean,
  value: boolean | null | undefined,
): string {
  if (!applicable) return 'Não aplicável';
  return simNao(value);
}

export function formatStayDaysLabel(stayDays: string | undefined): string {
  if (!stayDays) return '';
  if (stayDays === 'full') return 'Todos';
  if (stayDays === '1') return '1 dia';
  if (stayDays === '2') return '2 dias';
  if (stayDays === '3') return '3 dias';
  return stayDays;
}

export function formatExportDateTime(
  value: Date | string | undefined | null,
): string {
  if (value == null || value === '') return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return `${get('day')}-${get('month')}-${get('year')} ${get('hour')}:${get('minute')}`;
}

export function formatPaymentAmountBrl(cents: number | undefined | null): string {
  if (cents == null || !Number.isFinite(cents)) return '';
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** 16–17 needs responsible; 18+ parental auth not applicable */
export function parentalAuthorizationLabel(
  age: number | null | undefined,
  authorized: boolean | undefined,
): string {
  if (age == null || age >= 18) return 'Não aplicável';
  if (age >= 16 && age < 18) return simNao(authorized);
  return 'Não aplicável';
}

export function needsCribLabel(
  accommodationType: string | undefined,
  bringingChildren: boolean | undefined,
  needsCrib: boolean | undefined,
): string {
  const suite = accommodationType === 'Suíte';
  if (!suite || !bringingChildren) return 'Não aplicável';
  return simNao(needsCrib);
}
