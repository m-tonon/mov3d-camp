/** Acampamento ORIGENS — copy and constants for registration UI */

export const ORIGENS = {
  title: 'Acampamento Origens',
  datesLabel: '05 a 09 de fevereiro de 2027',
  datesShort: '05/02/2027',
  venue: 'Acampamento Evangélico Maanaim — Mandaguaçu',
  address: 'Estrada 1240, Estrada Arns, 1516, Mandaguaçu - PR',
  minAge: 16,
  arrival: 'Sexta a partir das 19h00',
  departure: 'Terça após o almoço',
  socialInstagram: [
    {
      handle: '@mov.3d',
      url: 'https://www.instagram.com/mov.3d/',
      label: 'MOV 3D',
    },
    {
      handle: '@cd_jovem',
      url: 'https://www.instagram.com/cd_jovem/',
      label: 'CD Jovem',
    },
  ] as const,
  mapsQuery: 'Estrada Arns, 1516, Mandaguaçu - PR',
  churchAddress: 'Av. Paissandu, 32 - Vila Operária, Maringá',
  contact: {
    name: 'Beatriz Jarillo',
    phone: '(44) 99978-0904',
    phoneDigits: '44999780904',
  },
} as const;

export const CAMP_HEADER_IMAGE = '/camp-header.jpg';

export const SHIRT_MODELS = [
  { id: 'Modelo 1', label: 'Modelo 1', image: '/t-shirt-1.jpg' },
  { id: 'Modelo 2', label: 'Modelo 2', image: '/t-shirt-2.jpg' },
] as const;

export const PRICING = {
  /** centavos */
  alojamentoFull: 43_000,
  suitePerPerson: 49_000,
  dailyPerDay: 15_000,
  shirt: 9_000,
  shirtMaxQuantity: 10,
  maxInstallments: 6,
} as const;

export const STAY_DAYS_HELP =
  'A chegada é na sexta à noite e a saída na terça após o almoço. Para diárias, contamos os dias completos de sábado, domingo e segunda — escolha 1, 2 ou 3. A opção “Período completo” corresponde ao pacote de alojamento (R$ 430) ou suíte (R$ 490/pessoa).';
