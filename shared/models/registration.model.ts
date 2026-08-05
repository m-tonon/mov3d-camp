import mongoose from 'mongoose';

const PaymentDataSchema = new mongoose.Schema(
  {
    referenceId: String,
    paymentConfirmed: Boolean,
    name: String,
    cpf: String,
    email: String,
    phone: String,
    paymentLink: String,
    amount: Number,
    maxInstallments: Number,
  },
  { _id: false },
);

const ShirtLineSchema = new mongoose.Schema(
  {
    model: String,
    size: String,
    quantity: { type: Number, default: 1 },
  },
  { _id: false },
);

const ShirtSchema = new mongoose.Schema(
  {
    wantsShirt: Boolean,
    items: [ShirtLineSchema],
  },
  { _id: false },
);

const StaySchema = new mongoose.Schema(
  {
    accommodationType: String,
    stayDays: String,
    bringingChildren: Boolean,
    childrenDetails: String,
    needsCrib: Boolean,
  },
  { _id: false },
);

const RegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    birthDate: String,
    age: Number,
    gender: String,
    cpf: String,
    whatsapp: String,
    email: String,

    churchMembership: String,
    churchName: String,
    attendedPreviousIpvoCamps: String,

    hasHealthPlan: String,
    healthPlanName: String,

    allergies: String,

    shirt: ShirtSchema,
    stay: StaySchema,

    responsibleInfo: {
      name: String,
      phone: String,
      relation: String,
      document: String,
      email: String,
    },
    parentalAuthorization: Boolean,
    payment: PaymentDataSchema,

    isSuiteRegistration: { type: Boolean, default: false },
    /** Inscrição # visível no admin e export (1, 2, 3…) */
    registrationNumber: { type: Number, unique: true, sparse: true },
    /** Quem paga a suíte (número da inscrição do pagador) — preenchido no cônjuge */
    suitePayerRegistrationNumber: { type: Number, default: null },
    /** Número da inscrição do cônjuge — preenchido no pagador */
    suitePartnerRegistrationNumber: { type: Number, default: null },
    suiteRole: { type: String, enum: ['payer', 'partner'], required: false },
    /** Grupo da suíte (mesmo número para o casal) */
    suiteGroupNumber: { type: Number, default: null },
    suitePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
    },
    suitePartnerName: String,
  },
  { timestamps: true },
);

RegistrationSchema.index({ cpf: 1 });
RegistrationSchema.index({ registrationNumber: 1 });
RegistrationSchema.index({ suitePayerRegistrationNumber: 1 });
RegistrationSchema.index({ suiteGroupNumber: 1 });

export const RegistrationModel =
  mongoose.models.Registration ||
  mongoose.model('Registration', RegistrationSchema);
