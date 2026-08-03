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
    amount: Number, // Add amount field
  },
  { _id: false },
);

const RegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    birthDate: String,
    age: Number,
    gender: String,
    identityDocument: String,
    address: String,
    churchMembership: String,
    churchName: String,
    healthInsurance: String,
    medications: String,
    allergies: String,
    specialNeeds: String,
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
    suitePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
    },
    suitePartnerName: String,
  },
  { timestamps: true },
);

export const RegistrationModel =
  mongoose.models.Registration ||
  mongoose.model('Registration', RegistrationSchema);
