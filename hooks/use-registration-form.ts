import { useState, useEffect, useMemo } from 'react';
import {
  PaymentInfo,
  RegistrationFormData,
  ShirtSelection,
  StayInfo,
} from '@/shared/registration.interface';
import { saveRegistration } from '@/services/registration';
import { ORIGENS, PRICING } from '@/lib/event-config';
import { getRegistrationPriceBreakdown } from '@/lib/pricing';
import {
  createEmptyShirtLine,
  createEmptyShirtSelection,
  shirtLineUnits,
  totalShirtUnits,
} from '@/lib/shirt-lines';
import type { AccommodationType, StayDays } from '@/shared/registration.interface';
import {
  calculateAgeFromBirthDate,
  isBirthDateInFuture,
  isCompleteBirthDate,
  maskBirthDateInput,
} from '@/lib/birth-date';

export type FormStep =
  | 'orientations'
  | 'participant'
  | 'shirt'
  | 'stay'
  | 'suitePartner'
  | 'responsible';

export const STEP_LABELS: Record<FormStep, string> = {
  orientations: 'Orientações',
  participant: 'Acampante',
  shirt: 'Camiseta',
  stay: 'Estadia',
  suitePartner: 'Cônjuge',
  responsible: 'Responsável',
};

export const PAYMENT_MAX_INSTALLMENTS = PRICING.maxInstallments;

const emptyShirt = (): ShirtSelection => createEmptyShirtSelection();

const emptyStay = (): StayInfo => ({
  accommodationType: '',
  stayDays: '',
  bringingChildren: false,
  childrenDetails: '',
  needsCrib: false,
});

const emptyResponsible = () => ({
  name: '',
  document: '',
  phone: '',
  email: '',
  relation: '',
});

function createEmptyParticipant(
  isSuiteRegistration = false,
): RegistrationFormData {
  return {
    name: '',
    birthDate: '',
    age: null,
    gender: '',
    cpf: '',
    whatsapp: '',
    email: '',
    churchMembership: '',
    churchName: '',
    attendedPreviousIpvoCamps: '',
    hasHealthPlan: '',
    healthPlanName: '',
    allergies: '',
    shirt: emptyShirt(),
    stay: emptyStay(),
    responsibleInfo: emptyResponsible(),
    parentalAuthorization: false,
    payment: {
      referenceId: '',
      paymentConfirmed: false,
      amount: 0,
      paymentLink: '',
    },
    isSuiteRegistration,
  };
}

interface UseRegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
}

export function useRegistrationForm({ onSubmit }: UseRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('orientations');
  const [formData, setFormData] = useState<RegistrationFormData>(
    createEmptyParticipant(false),
  );
  const [suitePartner, setSuitePartner] = useState<RegistrationFormData>(
    createEmptyParticipant(true),
  );

  const isSuite = formData.stay.accommodationType === 'Suíte';

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mainAge = formData.birthDate
    ? calculateAgeFromBirthDate(formData.birthDate)
    : null;
  const partnerAge = suitePartner.birthDate
    ? calculateAgeFromBirthDate(suitePartner.birthDate)
    : null;

  const needsResponsible = useMemo(() => {
    const mainMinor =
      mainAge !== null && mainAge >= ORIGENS.minAge && mainAge < 18;
    const partnerMinor =
      isSuite &&
      partnerAge !== null &&
      partnerAge >= ORIGENS.minAge &&
      partnerAge < 18;
    return mainMinor || partnerMinor;
  }, [mainAge, partnerAge, isSuite]);

  const stayReady =
    formData.stay.accommodationType !== '' &&
    formData.stay.stayDays !== '';

  const priceOptions = useMemo(() => {
    if (!stayReady) return null;
    return {
      accommodationType: formData.stay.accommodationType as AccommodationType,
      stayDays: formData.stay.stayDays as StayDays,
      isSuite,
      shirtQuantity: totalShirtUnits(formData.shirt),
    };
  }, [
    stayReady,
    formData.stay.accommodationType,
    formData.stay.stayDays,
    isSuite,
    formData.shirt,
  ]);

  const paymentBreakdown = useMemo(
    () => (priceOptions ? getRegistrationPriceBreakdown(priceOptions) : null),
    [priceOptions],
  );

  const paymentAmount = paymentBreakdown?.totalCents ?? 0;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      isSuiteRegistration: isSuite,
      payment: { ...prev.payment, amount: paymentAmount },
    }));
  }, [paymentAmount, isSuite]);

  useEffect(() => {
    if (!isSuite && currentStep === 'suitePartner') {
      setCurrentStep('stay');
    }
  }, [isSuite, currentStep]);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.replace(/(\d{1,2})/, '($1');
    if (digits.length <= 7) return digits.replace(/(\d{2})(\d+)/, '($1) $2');
    if (digits.length <= 11)
      return digits.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    return digits;
  };

  const applyParticipantChange = (
    prev: RegistrationFormData,
    name: string,
    value: string | boolean,
  ): RegistrationFormData => {
    if (name === 'cpf') {
      return { ...prev, cpf: formatCPF(String(value)) };
    }
    if (name === 'whatsapp') {
      return { ...prev, whatsapp: formatPhone(String(value)) };
    }
    if (name === 'birthDate') {
      const masked = maskBirthDateInput(String(value));
      return {
        ...prev,
        birthDate: masked,
        age: calculateAgeFromBirthDate(masked),
      };
    }
    if (name.startsWith('shirt.')) {
      const itemsMatch = name.match(/^shirt\.items\.(\d+)\.(model|size|quantity)$/);
      if (itemsMatch) {
        const index = Number(itemsMatch[1]);
        const field = itemsMatch[2] as 'model' | 'size' | 'quantity';
        const items = [...prev.shirt.items];
        while (items.length <= index) {
          items.push(createEmptyShirtLine());
        }
        const nextValue =
          field === 'quantity'
            ? (() => {
                const raw = String(value).replace(/\D/g, '');
                if (raw === '') return 0;
                const n = parseInt(raw, 10);
                return Math.min(
                  PRICING.shirtMaxQuantity,
                  Math.max(1, Number.isFinite(n) ? n : 1),
                );
              })()
            : value;
        items[index] = { ...items[index], [field]: nextValue };
        return { ...prev, shirt: { ...prev.shirt, items } };
      }
      if (name === 'shirt.wantsShirt') {
        const wants = value === true;
        return {
          ...prev,
          shirt: wants
            ? {
                wantsShirt: true,
                items:
                  prev.shirt.items.length > 0
                    ? prev.shirt.items
                    : [createEmptyShirtLine()],
              }
            : createEmptyShirtSelection(),
        };
      }
    }
    if (name.startsWith('stay.')) {
      const key = name.split('.')[1] as keyof StayInfo;
      return {
        ...prev,
        stay: { ...prev.stay, [key]: value },
      };
    }
    return { ...prev, [name]: value };
  };

  const handleMainChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    const val = type === 'checkbox' ? checked : value;

    if (name.startsWith('responsibleInfo.')) {
      const key = name.split('.')[1];
      if (key === 'document') {
        setFormData((prev) => ({
          ...prev,
          responsibleInfo: {
            ...prev.responsibleInfo,
            document: formatCPF(value),
          },
        }));
        return;
      }
      if (key === 'phone') {
        setFormData((prev) => ({
          ...prev,
          responsibleInfo: {
            ...prev.responsibleInfo,
            phone: formatPhone(value),
          },
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        responsibleInfo: { ...prev.responsibleInfo, [key!]: value },
      }));
      return;
    }

    setFormData((prev) => applyParticipantChange(prev, name, val as string));
  };

  const handleSuitePartnerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    const val = type === 'checkbox' ? checked : value;
    setSuitePartner((prev) => applyParticipantChange(prev, name, val as string));
  };

  const handleBlur = (name: string) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const generateReferenceId = () => {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `REF-${randomPart}`;
  };

  const validateParticipant = (data: RegistrationFormData, prefix: string) => {
    const minAgeForSuite = isSuite ? 18 : ORIGENS.minAge;
    if (!isCompleteBirthDate(data.birthDate)) return false;
    if (isBirthDateInFuture(data.birthDate)) return false;

    const age = calculateAgeFromBirthDate(data.birthDate);
    if (age === null || age < minAgeForSuite) return false;
    const base =
      !!data.name &&
      !!data.gender &&
      !!data.cpf.replace(/\D/g, '') &&
      !!data.whatsapp.replace(/\D/g, '') &&
      !!data.email &&
      !!data.churchMembership &&
      !!data.attendedPreviousIpvoCamps &&
      !!data.hasHealthPlan;

    if (!base) return false;
    if (data.churchMembership === 'sim' && !data.churchName.trim()) {
      return false;
    }
    if (data.hasHealthPlan === 'sim' && !data.healthPlanName.trim()) {
      return false;
    }
    return true;
  };

  const validateShirt = (shirt: ShirtSelection) => {
    if (!shirt.wantsShirt) return true;
    if (shirt.items.length === 0) return false;
    for (const item of shirt.items) {
      if (!item.model || !item.size) return false;
      if (shirtLineUnits(item.quantity) < 1) return false;
    }
    const total = totalShirtUnits(shirt);
    return total >= 1 && total <= PRICING.shirtMaxQuantity;
  };

  const addShirtLine = () => {
    setFormData((prev) => {
      if (totalShirtUnits(prev.shirt) >= PRICING.shirtMaxQuantity) return prev;
      return {
        ...prev,
        shirt: {
          wantsShirt: true,
          items: [...prev.shirt.items, createEmptyShirtLine()],
        },
      };
    });
  };

  const removeShirtLine = (index: number) => {
    setFormData((prev) => {
      if (prev.shirt.items.length <= 1) return prev;
      return {
        ...prev,
        shirt: {
          ...prev.shirt,
          items: prev.shirt.items.filter((_, i) => i !== index),
        },
      };
    });
  };

  const normalizeShirtQuantityOnBlur = (index: number) => {
    setFormData((prev) => {
      const items = [...prev.shirt.items];
      const line = items[index];
      if (!line) return prev;
      if (line.quantity < 1) {
        items[index] = { ...line, quantity: 1 };
      }
      return { ...prev, shirt: { ...prev.shirt, items } };
    });
  };

  const validateStay = (stay: StayInfo) => {
    if (!stay.accommodationType || !stay.stayDays) return false;
    if (stay.bringingChildren && !stay.childrenDetails.trim()) return false;
    return true;
  };

  const validateStep = (step: FormStep): boolean => {
    if (step === 'orientations') return true;
    if (step === 'participant') return validateParticipant(formData, 'main');
    if (step === 'shirt') return validateShirt(formData.shirt);
    if (step === 'stay') return validateStay(formData.stay);
    if (step === 'suitePartner') {
      return validateParticipant(suitePartner, 'suite');
    }
    if (step === 'responsible') {
      const fieldsOk =
        !!formData.responsibleInfo.name &&
        !!formData.responsibleInfo.document &&
        !!formData.responsibleInfo.phone &&
        !!formData.responsibleInfo.email;
      if (!fieldsOk) return false;
      if (needsResponsible && !formData.parentalAuthorization) return false;
      return true;
    }
    return true;
  };

  const stepOrder = useMemo((): FormStep[] => {
    const steps: FormStep[] = [
      'orientations',
      'participant',
      'shirt',
      'stay',
    ];
    if (isSuite) steps.push('suitePartner');
    if (needsResponsible) steps.push('responsible');
    return steps;
  }, [isSuite, needsResponsible]);

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setTouched((prev) => ({ ...prev, [`step_${currentStep}`]: true }));
      return;
    }
    const idx = stepOrder.indexOf(currentStep);
    if (idx >= 0 && idx < stepOrder.length - 1) {
      setCurrentStep(stepOrder[idx + 1]);
    }
  };

  const handleBack = () => {
    const idx = stepOrder.indexOf(currentStep);
    if (idx > 0) setCurrentStep(stepOrder[idx - 1]);
  };

  const isLastStep = stepOrder[stepOrder.length - 1] === currentStep;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLastStep) {
      handleNext();
      return;
    }

    for (const step of stepOrder) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        setTouched((prev) => ({ ...prev, [`step_${step}`]: true }));
        return;
      }
    }

    if (needsResponsible && !validateStep('responsible')) {
      setTouched((prev) => ({ ...prev, step_responsible: true }));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedMainName = formatName(formData.name);
      const formattedPartnerName = isSuite
        ? formatName(suitePartner.name)
        : '';

      const payer = needsResponsible
        ? {
            name: formatName(formData.responsibleInfo.name),
            cpf: formData.responsibleInfo.document.replace(/\D/g, ''),
            phone: formData.responsibleInfo.phone,
            email: formData.responsibleInfo.email,
          }
        : {
            name: formattedMainName,
            cpf: formData.cpf.replace(/\D/g, ''),
            phone: formData.whatsapp,
            email: formData.email,
          };

      const referenceId = generateReferenceId();
      const partnerReferenceId = isSuite ? generateReferenceId() : '';

      const checkoutRes = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId,
          amount: paymentAmount,
          email: payer.email,
          name: payer.name,
          cpf: payer.cpf,
          phone: payer.phone,
          maxInstallments: PAYMENT_MAX_INSTALLMENTS,
          isSuiteRegistration: isSuite,
          suitePartnerReferenceId: partnerReferenceId,
        }),
      });

      if (!checkoutRes.ok) throw new Error('Falha ao gerar link de pagamento.');

      const { paymentLink } = await checkoutRes.json();

      const paymentData: PaymentInfo = {
        referenceId,
        paymentConfirmed: false,
        paymentLink,
        amount: paymentAmount,
        name: payer.name,
        cpf: payer.cpf,
        email: payer.email,
        phone: payer.phone,
        maxInstallments: PAYMENT_MAX_INSTALLMENTS,
      };

      const updatedFormData: RegistrationFormData = {
        ...formData,
        name: formattedMainName,
        isSuiteRegistration: isSuite,
        payment: paymentData,
        suitePartner: isSuite
          ? {
              ...suitePartner,
              name: formattedPartnerName,
              stay: { ...formData.stay },
              payment: {
                ...suitePartner.payment,
                referenceId: partnerReferenceId,
                amount: 0,
              },
            }
          : undefined,
      };

      const saved = await saveRegistration(updatedFormData);

      onSubmit({
        ...updatedFormData,
        payment: {
          ...updatedFormData.payment,
          referenceId: saved.referenceId,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar inscrição. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    stepOrder,
    isLastStep,
    isSuite,
    needsResponsible,
    formData,
    suitePartner,
    touched,
    loading,
    error,
    paymentAmount,
    paymentBreakdown,
    handleMainChange,
    handleSuitePartnerChange,
    handleBlur,
    handleNext,
    handleBack,
    handleSubmit,
    calculateAge: calculateAgeFromBirthDate,
    addShirtLine,
    removeShirtLine,
    normalizeShirtQuantityOnBlur,
  };
}

const formatName = (name: string): string => {
  if (!name) return '';
  const lowercaseWords = ['de', 'da', 'do', 'dos', 'das', 'e'];
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && lowercaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
