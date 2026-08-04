import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  birthDate: z.string().min(1, 'A data de nascimento é obrigatória'),
  age: z.number().min(16),
  gender: z.string().min(1, 'O gênero é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  whatsapp: z.string().min(11, 'WhatsApp inválido'),
  email: z.string().email('E-mail inválido'),

  churchMembership: z.string().min(1, 'Informe se frequenta igreja'),
  churchName: z.string().optional(),
  attendedPreviousIpvoCamps: z.string().min(1, 'Campo obrigatório'),

  hasHealthPlan: z.string().min(1, 'Informe se possui plano de saúde'),
  healthPlanName: z.string().optional(),

  allergies: z.string().optional(),

  responsibleInfo: z
    .object({
      name: z.string().optional(),
      document: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      relation: z.string().optional(),
    })
    .optional(),

  parentalAuthorization: z.boolean().optional(),
});
