export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '').slice(0, 11);
}

export function formatCpfDisplay(cpf: string): string {
  const digits = normalizeCpf(cpf);
  if (digits.length !== 11) return cpf;
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
