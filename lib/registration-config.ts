export function isRegistrationOpen(): boolean {
  return process.env.NEXT_PUBLIC_REGISTRATIONS_OPEN === 'true';
}

export function areInstallmentsAvailable(): boolean {
  return process.env.NEXT_PUBLIC_INSTALLMENTS_AVAILABLE === 'true';
}
