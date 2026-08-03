import { z } from "zod"

export const registrationSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  birthDate: z.string().min(1, "A data de nascimento é obrigatória"),
  age: z.number().min(12).max(16),
  gender: z.string().min(1, "O gênero é obrigatório"),
  identityDocument: z.string().min(1, "Documento obrigatório"),

  address: z.string().optional(),
  churchMembership: z.string().optional(),
  churchName: z.string().optional(),

  healthInsurance: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  specialNeeds: z.string().optional(),

  responsibleInfo: z.object({
    name: z.string().min(1, "Nome do responsável obrigatório"),
    document: z.string().min(11, "CPF deve ter 11 caracteres"),
    phone: z.string().min(11, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    relation: z.string().optional(),
  }),

  parentalAuthorization: z.literal(true, {
    errorMap: () => ({ message: "Autorização obrigatória" }),
  }),
})