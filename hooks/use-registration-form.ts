import { useState, useEffect } from 'react';
import {
  PaymentInfo,
  RegistrationFormData,
} from '@/shared/registration.interface';
import { saveRegistration } from '@/services/registration';

export type FormStep = 'participant' | 'suitePartner' | 'responsible';

export const STEP_LABELS: Record<FormStep, string> = {
  participant: 'Dados do Acampante',
  suitePartner: 'Dados do Acompanhante',
  responsible: 'Informações do Responsável',
};

export const SUITE_PRICE = 88000;
export const INDIVIDUAL_PRICE = 28000;
export const STAFF_PRICE = 20000;
export const PAYMENT_MAX_INSTALLMENTS = 10;

interface UseRegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
}

export function useRegistrationForm({ onSubmit }: UseRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('participant');
  const [isSuite, setIsSuite] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    birthDate: '',
    age: null,
    gender: '',
    identityDocument: '',
    address: '',
    churchMembership: '',
    churchName: '',
    healthInsurance: '',
    medications: '',
    allergies: '',
    specialNeeds: '',
    responsibleInfo: {
      name: '',
      document: '',
      phone: '',
      email: '',
      relation: '',
    },
    parentalAuthorization: false,
    payment: {
      referenceId: '',
      paymentConfirmed: false,
      amount: INDIVIDUAL_PRICE,
      paymentLink: '',
    },
    isSuiteRegistration: false,
  });

  const [suitePartner, setSuitePartner] = useState<RegistrationFormData>({
    name: '',
    birthDate: '',
    age: null,
    gender: '',
    identityDocument: '',
    address: '',
    churchMembership: '',
    churchName: '',
    healthInsurance: '',
    medications: '',
    allergies: '',
    specialNeeds: '',
    responsibleInfo: {
      name: '',
      document: '',
      phone: '',
      email: '',
      relation: '',
    },
    parentalAuthorization: false,
    payment: {
      referenceId: '',
      paymentConfirmed: false,
      amount: 0,
      paymentLink: '',
    },
    isSuiteRegistration: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update amount when suite toggle changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        amount: isSuite ? SUITE_PRICE : INDIVIDUAL_PRICE,
      },
      isSuiteRegistration: isSuite,
    }));
  }, [isSuite]);

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const date = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age;
  };

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

  const handleMainChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'responsibleInfo.document') {
      setFormData((prev) => ({
        ...prev,
        responsibleInfo: {
          ...prev.responsibleInfo,
          document: formatCPF(value),
        },
      }));
      return;
    }

    if (name === 'responsibleInfo.phone') {
      setFormData((prev) => ({
        ...prev,
        responsibleInfo: { ...prev.responsibleInfo, phone: formatPhone(value) },
      }));
      return;
    }

    if (name.startsWith('responsibleInfo.')) {
      const key = name.split('.')[1];
      const capitalizeWords = (text: string) => {
        if (!text) return '';
        return text
          .toLowerCase()
          .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
      };
      const formattedValue =
        key === 'relation' ? capitalizeWords(value) : value;

      setFormData((prev) => ({
        ...prev,
        responsibleInfo: { ...prev.responsibleInfo, [key]: formattedValue },
      }));
      return;
    }

    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (name === 'birthDate') {
      setFormData((prev) => ({
        ...prev,
        birthDate: value,
        age: calculateAge(value),
      }));
    }
  };

  const handleSuitePartnerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    const val = type === 'checkbox' ? checked : value;

    setSuitePartner((prev) => ({ ...prev, [name]: val }));

    if (name === 'birthDate') {
      setSuitePartner((prev) => ({
        ...prev,
        birthDate: value,
        age: calculateAge(value),
      }));
    }
  };

  const handleBlur = (name: string) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const generateReferenceId = () => {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `REF-${randomPart}`;
  };

  const validateStep = (step: FormStep): boolean => {
    if (step === 'participant') {
      const age = formData.birthDate ? calculateAge(formData.birthDate) : null;
      return (
        !!formData.name &&
        !!formData.birthDate &&
        !!formData.gender &&
        !!formData.identityDocument &&
        age !== null &&
        age >= (isSuite ? 18 : 11)
      );
    }

    if (step === 'suitePartner') {
      const age = suitePartner.birthDate
        ? calculateAge(suitePartner.birthDate)
        : null;
      return (
        !!suitePartner.name &&
        !!suitePartner.birthDate &&
        !!suitePartner.gender &&
        !!suitePartner.identityDocument &&
        age !== null &&
        age >= 18
      );
    }

    if (step === 'responsible') {
      return (
        !!formData.responsibleInfo.name &&
        !!formData.responsibleInfo.document &&
        !!formData.responsibleInfo.phone &&
        !!formData.responsibleInfo.email
      );
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      const fieldsToTouch =
        currentStep === 'participant'
          ? [
              'main_name',
              'main_birthDate',
              'main_gender',
              'main_identityDocument',
            ]
          : currentStep === 'suitePartner'
            ? [
                'suite_name',
                'suite_birthDate',
                'suite_gender',
                'suite_identityDocument',
              ]
            : [
                'responsibleInfo.name',
                'responsibleInfo.document',
                'responsibleInfo.phone',
                'responsibleInfo.email',
              ];

      setTouched((prev) => {
        const newTouched = { ...prev };
        fieldsToTouch.forEach((f) => (newTouched[f] = true));
        return newTouched;
      });
      return;
    }

    if (currentStep === 'participant') {
      setCurrentStep(isSuite ? 'suitePartner' : 'responsible');
    } else if (currentStep === 'suitePartner') {
      setCurrentStep('responsible');
    }
  };

  const handleBack = () => {
    if (currentStep === 'suitePartner') {
      setCurrentStep('participant');
    } else if (currentStep === 'responsible') {
      setCurrentStep(isSuite ? 'suitePartner' : 'participant');
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep('responsible')) {
      const fieldsToTouch = [
        'responsibleInfo.name',
        'responsibleInfo.document',
        'responsibleInfo.phone',
        'responsibleInfo.email',
      ];
      setTouched((prev) => {
        const newTouched = { ...prev };
        fieldsToTouch.forEach((f) => (newTouched[f] = true));
        return newTouched;
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedMainName = formatName(formData.name);
      const formattedSuitePartnerName = isSuite ? formatName(suitePartner.name) : '';
      const formattedResponsibleName = formatName(formData.responsibleInfo.name);

      const referenceId = generateReferenceId();
      const partnerReferenceId = isSuite ? generateReferenceId() : '';

      const paymentAmount = isSuite ? SUITE_PRICE : INDIVIDUAL_PRICE;

      const checkoutRes = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId,
          amount: paymentAmount,
          email: formData.responsibleInfo.email,
          name: formattedResponsibleName,
          cpf: formData.responsibleInfo.document.replace(/\D/g, ''),
          phone: formData.responsibleInfo.phone,
          isSuiteRegistration: isSuite,
          suitePartnerReferenceId: partnerReferenceId,
        }),
      });

      if (!checkoutRes.ok) throw new Error('Falha ao gerar link de pagamento.');

      const { paymentLink } = await checkoutRes.json();

      const paymentData: PaymentInfo = {
        referenceId,
        paymentConfirmed: false,
        paymentLink: paymentLink,
        amount: paymentAmount,
        name: formattedResponsibleName,
        cpf: formData.responsibleInfo.document.replace(/\D/g, ''),
        email: formData.responsibleInfo.email,
        phone: formData.responsibleInfo.phone,
      };

      const updatedFormData: RegistrationFormData = {
        ...formData,
        name: formattedMainName,
        payment: paymentData,
        suitePartner: isSuite
          ? {
              ...suitePartner,
              name: formattedSuitePartnerName,
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
    isSuite,
    setIsSuite,
    formData,
    suitePartner,
    touched,
    loading,
    error,
    handleMainChange,
    handleSuitePartnerChange,
    handleBlur,
    handleNext,
    handleBack,
    handleSubmit,
    calculateAge,
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
