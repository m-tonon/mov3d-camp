export interface PaymentInfo {
  referenceId: string;
  paymentConfirmed?: boolean;
  paymentLink?: string;
  amount?: number;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  isStaffType?: boolean;
  maxInstallments?: number;
}

export interface ResponsibleInfo {
  name: string;
  document: string;
  phone: string;
  email: string;
  relation: string;
}

export interface RegistrationFormData {
  name: string;
  birthDate: string;
  age: number | null;
  gender: string;
  identityDocument: string;
  address: string;
  churchMembership: string;
  churchName: string;
  healthInsurance: string;
  medications: string;
  allergies: string;
  specialNeeds: string;
  responsibleInfo: ResponsibleInfo;
  parentalAuthorization: boolean;
  payment: PaymentInfo;
  isSuiteRegistration?: boolean;
  suitePartner?: RegistrationFormData;
}

export interface SaveRegistrationResponse {
  referenceId: string;
  message?: string;
}
