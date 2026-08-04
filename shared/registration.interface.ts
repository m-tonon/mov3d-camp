export interface PaymentInfo {
  referenceId: string;
  paymentConfirmed?: boolean;
  paymentLink?: string;
  amount?: number;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  maxInstallments?: number;
}

export interface ResponsibleInfo {
  name: string;
  document: string;
  phone: string;
  email: string;
  relation: string;
}

export type AccommodationType = 'Alojamento' | 'Suíte';
export type StayDays = 'full' | '1' | '2' | '3';
export type ShirtModel = 'Modelo 1' | 'Modelo 2' | '';
export type ShirtSize = 'P' | 'M' | 'G' | 'GG' | '';

export interface ShirtLineItem {
  model: ShirtModel;
  size: ShirtSize;
  quantity: number;
}

export interface ShirtSelection {
  wantsShirt: boolean;
  items: ShirtLineItem[];
}

export interface StayInfo {
  accommodationType: AccommodationType | '';
  stayDays: StayDays | '';
  bringingChildren: boolean;
  childrenDetails: string;
  needsCrib: boolean;
}

export interface RegistrationFormData {
  name: string;
  birthDate: string;
  age: number | null;
  gender: string;
  cpf: string;
  whatsapp: string;
  email: string;

  churchMembership: string;
  churchName: string;

  attendedPreviousIpvoCamps: string;

  hasHealthPlan: string;
  healthPlanName: string;

  allergies: string;

  shirt: ShirtSelection;
  stay: StayInfo;

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
