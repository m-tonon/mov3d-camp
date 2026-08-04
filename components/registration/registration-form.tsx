'use client';

import Image from 'next/image';
import { RegistrationFormData } from '@/shared/registration.interface';
import {
  useRegistrationForm,
  STEP_LABELS,
} from '@/hooks/use-registration-form';
import { RegistrationOrientations } from '@/components/registration/registration-orientations';
import { ORIGENS, PRICING, STAY_DAYS_HELP, SHIRT_MODELS } from '@/lib/event-config';
import { formatBrlFromCents } from '@/lib/pricing';
import { totalShirtUnits } from '@/lib/shirt-lines';
import {
  calculateAgeFromBirthDate,
  isBirthDateInFuture,
  isCompleteBirthDate,
} from '@/lib/birth-date';

interface Props {
  onSubmit: (data: RegistrationFormData) => void;
}

function shirtChoiceTitle(index: number, total: number): string {
  if (total === 1) return 'O que você quer pedir?';
  return `Pedido #${index + 1}`;
}

export function RegistrationForm({ onSubmit }: Props) {
  const {
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
    paymentBreakdown,
    handleMainChange,
    handleSuitePartnerChange,
    handleBlur,
    handleBack,
    handleSubmit,
    calculateAge,
    addShirtLine,
    removeShirtLine,
    normalizeShirtQuantityOnBlur,
  } = useRegistrationForm({ onSubmit });

  const inputBase =
    'w-full bg-background border rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/50';
  const inputNormal = `${inputBase} border-border`;
  const inputError = `${inputBase} border-destructive/60 bg-destructive/5 focus:ring-destructive/30 focus:border-destructive`;

  const showError = (field: string, empty: boolean) =>
    (touched[field] || touched[`step_${currentStep}`]) && empty;

  const getInputClass = (field: string, value: string | null | boolean) => {
    const isEmpty =
      value === '' || value === null || value === false || value === undefined;
    if (!showError(field, isEmpty)) return inputNormal;
    return isEmpty ? inputError : inputNormal;
  };

  const FieldError = ({ message }: { message: string }) => (
    <p className="text-xs text-destructive mt-1">{message}</p>
  );

  const SectionDivider = ({
    icon,
    title,
    subtitle,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
  }) => (
    <div className="flex items-center gap-3 pt-2">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex-1 h-px bg-border ml-2" />
    </div>
  );

  const renderParticipantFields = (
    data: RegistrationFormData,
    onChange: typeof handleMainChange,
    fieldPrefix: string,
    options: { isPartner?: boolean } = {},
  ) => {
    const age = data.birthDate ? calculateAge(data.birthDate) : null;
    const minAge = options.isPartner || isSuite ? 18 : ORIGENS.minAge;
    const birthComplete = isCompleteBirthDate(data.birthDate);
    const birthInvalid =
      birthComplete && calculateAgeFromBirthDate(data.birthDate) === null;
    const birthFuture =
      birthComplete && isBirthDateInFuture(data.birthDate);
    const ageError =
      birthComplete && !birthInvalid && !birthFuture && age !== null && age < minAge
        ? `É necessário ter pelo menos ${minAge} anos para se inscrever.`
        : null;
    const birthFieldTouched =
      touched[`${fieldPrefix}birthDate`] || touched[`step_${currentStep}`];

    return (
      <>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nome completo *
          </label>
          <input
            name="name"
            className={getInputClass(`${fieldPrefix}name`, data.name)}
            value={data.name}
            onChange={onChange}
            onBlur={() => handleBlur(`${fieldPrefix}name`)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Sexo *
            </label>
            <select
              name="gender"
              className={getInputClass(`${fieldPrefix}gender`, data.gender)}
              value={data.gender}
              onChange={onChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={`${fieldPrefix}birthDate`}
              className="block text-xs font-medium text-muted-foreground mb-1"
            >
              Data de nascimento *{' '}
            </label>
            <input
              id={`${fieldPrefix}birthDate`}
              type="text"
              name="birthDate"
              inputMode="numeric"
              autoComplete="bday"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              className={getInputClass(`${fieldPrefix}birthDate`, data.birthDate)}
              value={data.birthDate}
              onChange={onChange}
              onBlur={() => handleBlur(`${fieldPrefix}birthDate`)}
              required
              aria-invalid={!!ageError || birthInvalid || birthFuture}
            />
            {birthFieldTouched && data.birthDate && !birthComplete && (
              <FieldError message="Informe a data completa no formato dd/mm/aaaa." />
            )}
            {birthFieldTouched && birthInvalid && (
              <FieldError message="Data inválida. Verifique dia, mês e ano." />
            )}
            {birthFieldTouched && birthFuture && (
              <FieldError message="A data de nascimento não pode ser no futuro." />
            )}
            {ageError && <FieldError message={ageError} />}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Idade
            </label>
            <div className={`${inputNormal} text-center font-semibold`}>
              {age !== null ? `${age} anos` : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              WhatsApp *
            </label>
            <input
              name="whatsapp"
              placeholder="(44) 99999-9999"
              className={getInputClass(`${fieldPrefix}whatsapp`, data.whatsapp)}
              value={data.whatsapp}
              onChange={onChange}
              maxLength={15}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              CPF *
            </label>
            <input
              name="cpf"
              placeholder="000.000.000-00"
              className={getInputClass(`${fieldPrefix}cpf`, data.cpf)}
              value={data.cpf}
              onChange={onChange}
              maxLength={14}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            E-mail *
          </label>
          <input
            type="email"
            name="email"
            className={getInputClass(`${fieldPrefix}email`, data.email)}
            value={data.email}
            onChange={onChange}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Usado para pagamento e confirmação da inscrição.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Frequenta alguma igreja? *
            </label>
            <select
              name="churchMembership"
              className={getInputClass(
                `${fieldPrefix}churchMembership`,
                data.churchMembership,
              )}
              value={data.churchMembership}
              onChange={onChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          {data.churchMembership === 'sim' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Se sim, qual? *
              </label>
              <input
                name="churchName"
                className={getInputClass(
                  `${fieldPrefix}churchName`,
                  data.churchName,
                )}
                value={data.churchName}
                onChange={onChange}
                required
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Já foi em outros acampamentos da IPVO? *
          </label>
          <select
            name="attendedPreviousIpvoCamps"
            className={getInputClass(
              `${fieldPrefix}attendedPreviousIpvoCamps`,
              data.attendedPreviousIpvoCamps,
            )}
            value={data.attendedPreviousIpvoCamps}
            onChange={onChange}
            required
          >
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao_primeiro">
              Não, esse é o meu primeiro acampamento
            </option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Possui plano de saúde? *
            </label>
            <select
              name="hasHealthPlan"
              className={getInputClass(
                `${fieldPrefix}hasHealthPlan`,
                data.hasHealthPlan,
              )}
              value={data.hasHealthPlan}
              onChange={onChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          {data.hasHealthPlan === 'sim' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Se sim, qual? *
              </label>
              <input
                name="healthPlanName"
                className={getInputClass(
                  `${fieldPrefix}healthPlanName`,
                  data.healthPlanName,
                )}
                value={data.healthPlanName}
                onChange={onChange}
                required
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Alergias ou informações importantes de saúde
          </label>
          <textarea
            name="allergies"
            className={`${inputNormal} resize-none`}
            rows={2}
            value={data.allergies}
            onChange={onChange}
            placeholder="Alergias, restrições, observações..."
          />
        </div>
      </>
    );
  };

  const renderShirtStep = (
    data: RegistrationFormData,
    onChange: typeof handleMainChange,
    prefix: string,
  ) => {
    const shirtTotal = totalShirtUnits(data.shirt);
    const canAddLine =
      data.shirt.wantsShirt && shirtTotal < PRICING.shirtMaxQuantity;

    return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Camiseta especial do acampamento — {formatBrlFromCents(PRICING.shirt)}{' '}
        cada. Tamanhos P ao GG. Inclua aqui todas as camisetas desta inscrição
        (suas e, na suíte, do cônjuge se quiser).
      </p>
      <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer">
        <input
          type="checkbox"
          name="shirt.wantsShirt"
          checked={data.shirt.wantsShirt}
          onChange={onChange}
          className="w-5 h-5 accent-primary"
        />
        <span className="text-sm font-medium">Quero garantir minha camiseta</span>
      </label>
      {data.shirt.wantsShirt && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Modelos disponíveis
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SHIRT_MODELS.map((model) => (
                <div
                  key={model.id}
                  className="rounded-2xl border border-border overflow-hidden bg-card"
                >
                  <div className="px-4 py-2.5 border-b border-border/80 text-sm font-semibold">
                    {model.label}
                  </div>
                  <div className="relative w-full aspect-[5/3] min-h-[140px] bg-muted/30">
                    <Image
                      src={model.image}
                      alt={`Visual do ${model.label}`}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha modelo, tamanho e quantidade. Precisa de mais de um modelo
              ou tamanho? Use o botão no final da página.
            </p>
          {data.shirt.items.map((item, index) => (
            <div
              key={`${prefix}-shirt-${index}`}
              className="rounded-2xl border border-border p-4 space-y-3 bg-card/50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {shirtChoiceTitle(index, data.shirt.items.length)}
                </p>
                {data.shirt.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeShirtLine(index)}
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Modelo *
                  </label>
                  <select
                    name={`shirt.items.${index}.model`}
                    className={getInputClass(
                      `${prefix}shirtItems.${index}.model`,
                      item.model,
                    )}
                    value={item.model}
                    onChange={onChange}
                  >
                    <option value="">Selecione...</option>
                    {SHIRT_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tamanho *
                  </label>
                  <select
                    name={`shirt.items.${index}.size`}
                    className={getInputClass(
                      `${prefix}shirtItems.${index}.size`,
                      item.size,
                    )}
                    value={item.size}
                    onChange={onChange}
                  >
                    <option value="">Selecione...</option>
                    {(['P', 'M', 'G', 'GG'] as const).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name={`shirt.items.${index}.quantity`}
                    className={getInputClass(
                      `${prefix}shirtItems.${index}.quantity`,
                      item.quantity < 1 ? '' : String(item.quantity),
                    )}
                    value={item.quantity < 1 ? '' : String(item.quantity)}
                    onChange={onChange}
                    onBlur={() => normalizeShirtQuantityOnBlur(index)}
                  />
                </div>
              </div>
              {showError(
                `${prefix}shirtItems.${index}.model`,
                !item.model,
              ) && <FieldError message="Selecione o modelo." />}
            </div>
          ))}
          </div>
          {canAddLine && (
            <button
              type="button"
              onClick={() => addShirtLine()}
              className="w-full py-3 text-sm font-medium rounded-xl border border-dashed border-primary/50 text-primary hover:bg-primary/5"
            >
              + Pedir outro modelo ou tamanho
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            Total de camisetas: {shirtTotal} de {PRICING.shirtMaxQuantity}{' '}
            (nesta inscrição).
          </p>
        </div>
      )}
    </section>
    );
  };

  const renderStayStep = () => (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">{STAY_DAYS_HELP}</p>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Tipo de dormitório *
        </label>
        <select
          name="stay.accommodationType"
          className={getInputClass(
            'stay.accommodationType',
            formData.stay.accommodationType,
          )}
          value={formData.stay.accommodationType}
          onChange={handleMainChange}
        >
          <option value="">Selecione...</option>
          <option value="Alojamento">
            Alojamento ({formatBrlFromCents(PRICING.alojamentoFull)} período
            completo)
          </option>
          <option value="Suíte">
            Suíte — casados ({formatBrlFromCents(PRICING.suitePerPerson)} por
            pessoa)
          </option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Quantos dias vai ficar? *
        </label>
        <select
          name="stay.stayDays"
          className={getInputClass('stay.stayDays', formData.stay.stayDays)}
          value={formData.stay.stayDays}
          onChange={handleMainChange}
        >
          <option value="">Selecione...</option>
          <option value="full">Período completo (sexta à terça)</option>
          <option value="1">1 dia (sábado, domingo ou segunda)</option>
          <option value="2">2 dias</option>
          <option value="3">3 dias</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Vai levar filhos? (sem programação infantil)
        </label>
        <select
          name="stay.bringingChildren"
          className={inputNormal}
          value={formData.stay.bringingChildren ? 'sim' : 'nao'}
          onChange={(e) =>
            handleMainChange({
              target: {
                name: 'stay.bringingChildren',
                type: 'checkbox',
                checked: e.target.value === 'sim',
              },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        >
          <option value="nao">Não</option>
          <option value="sim">Sim</option>
        </select>
      </div>

      {formData.stay.bringingChildren && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Quantos filhos e idades? *
          </label>
          <textarea
            name="stay.childrenDetails"
            className={getInputClass(
              'stay.childrenDetails',
              formData.stay.childrenDetails,
            )}
            rows={2}
            value={formData.stay.childrenDetails}
            onChange={handleMainChange}
            placeholder="Ex: 1 filho, 4 anos"
          />
        </div>
      )}

      {isSuite && formData.stay.bringingChildren && (
        <label className="flex items-center gap-3 p-4 rounded-xl border border-border">
          <input
            type="checkbox"
            name="stay.needsCrib"
            checked={formData.stay.needsCrib}
            onChange={handleMainChange}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-sm">Precisamos de berço na suíte</span>
        </label>
      )}

      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm space-y-3">
        <p className="font-medium">Estimativa desta inscrição</p>
        {paymentBreakdown ? (
          <>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex justify-between gap-4">
                <span>
                  {formData.stay.accommodationType}
                  {paymentBreakdown.peopleCount > 1
                    ? ` (${paymentBreakdown.peopleCount} pessoas × ${formatBrlFromCents(paymentBreakdown.lodgingPerPersonCents)})`
                    : ''}
                </span>
                <span className="text-foreground font-medium tabular-nums">
                  {formatBrlFromCents(paymentBreakdown.lodgingTotalCents)}
                </span>
              </li>
              {paymentBreakdown.shirtQuantity > 0 && (
                <li className="flex justify-between gap-4">
                  <span>Camisetas × {paymentBreakdown.shirtQuantity}</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {formatBrlFromCents(paymentBreakdown.shirtCents)}
                  </span>
                </li>
              )}
            </ul>
            <p className="text-2xl font-black pt-1 border-t border-primary/20">
              {formatBrlFromCents(paymentBreakdown.totalCents)}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            Selecione o dormitório e os dias para ver o valor.
          </p>
        )}
        {isSuite && paymentBreakdown && (
          <p className="text-xs text-muted-foreground">
            Inclui duas pessoas na suíte (você preencherá os dados do cônjuge na
            próxima etapa).
          </p>
        )}
      </div>

      {isLastStep && !needsResponsible && (
        <div className="text-sm space-y-2.5 pt-2 border-t border-border">
          <p>
            Após continuar, você poderá pagar com segurança pelo PagBank
            (parcelamento em até {PRICING.maxInstallments}x).
          </p>
        </div>
      )}
    </section>
  );

  const renderResponsible = () => (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Para acampantes de 16 ou 17 anos, precisamos dos dados do responsável
        legal para autorização e pagamento.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nome do responsável *
          </label>
          <input
            name="responsibleInfo.name"
            className={getInputClass(
              'responsibleInfo.name',
              formData.responsibleInfo.name,
            )}
            value={formData.responsibleInfo.name}
            onChange={handleMainChange}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            CPF *
          </label>
          <input
            name="responsibleInfo.document"
            className={getInputClass(
              'responsibleInfo.document',
              formData.responsibleInfo.document,
            )}
            value={formData.responsibleInfo.document}
            onChange={handleMainChange}
            maxLength={14}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Telefone *
          </label>
          <input
            name="responsibleInfo.phone"
            className={getInputClass(
              'responsibleInfo.phone',
              formData.responsibleInfo.phone,
            )}
            value={formData.responsibleInfo.phone}
            onChange={handleMainChange}
            maxLength={15}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            E-mail *
          </label>
          <input
            type="email"
            name="responsibleInfo.email"
            className={getInputClass(
              'responsibleInfo.email',
              formData.responsibleInfo.email,
            )}
            value={formData.responsibleInfo.email}
            onChange={handleMainChange}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Relação com o acampante
        </label>
        <input
          name="responsibleInfo.relation"
          className={inputNormal}
          value={formData.responsibleInfo.relation}
          onChange={handleMainChange}
          placeholder="Mãe, pai, tutor..."
        />
      </div>

      <label
        className={`flex gap-3 p-4 rounded-xl border cursor-pointer ${
          formData.parentalAuthorization
            ? 'border-primary/40 bg-primary/5'
            : showError('parentalAuthorization', !formData.parentalAuthorization)
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-border'
        }`}
      >
        <input
          type="checkbox"
          name="parentalAuthorization"
          checked={formData.parentalAuthorization}
          onChange={handleMainChange}
          onBlur={() => handleBlur('parentalAuthorization')}
          className="mt-0.5 w-5 h-5 accent-primary flex-shrink-0"
        />
        <span className="text-sm leading-relaxed text-foreground/90">
          Autorizo o(a) menor a participar do{' '}
          <strong className="text-foreground">Acampamento ORIGENS</strong> em{' '}
          {ORIGENS.datesLabel}, {ORIGENS.address}, em conformidade com o ECA.
        </span>
      </label>
      {showError('parentalAuthorization', !formData.parentalAuthorization) && (
        <FieldError message="A autorização do responsável é obrigatória." />
      )}
    </section>
  );

  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="w-full">
      {currentStep !== 'orientations' && (
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight">
            Formulário de inscrição
          </h1>
          <p className="text-muted-foreground text-sm">{ORIGENS.datesLabel}</p>
        </div>
      )}

      {currentStep !== 'orientations' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {stepOrder.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = step === currentStep;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone || isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {STEP_LABELS[step]}
              </span>
              {i < stepOrder.length - 1 && (
                <div className="w-6 h-px bg-border hidden sm:block" />
              )}
            </div>
          );
        })}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl shadow-sm divide-y divide-border overflow-hidden"
      >
        {currentStep === 'orientations' && (
          <section className="p-0">
            <RegistrationOrientations embedded />
          </section>
        )}

        {currentStep === 'participant' && (
          <section className="p-6 space-y-4">
            <SectionDivider
              icon="🧑"
              title="Acampante"
              subtitle="Campos com * são obrigatórios"
            />
            {renderParticipantFields(
              formData,
              handleMainChange,
              'main_',
            )}
          </section>
        )}

        {currentStep === 'shirt' && (
          <section className="p-6 space-y-4">
            <SectionDivider icon="👕" title="Camisetas" />
            {renderShirtStep(formData, handleMainChange, 'main_')}
          </section>
        )}

        {currentStep === 'stay' && (
          <section className="p-6 space-y-4">
            <SectionDivider icon="⛺" title="Estadia" />
            {renderStayStep()}
          </section>
        )}

        {currentStep === 'suitePartner' && isSuite && (
          <section className="p-6 space-y-4">
            <SectionDivider
              icon="💑"
              title="Dados do cônjuge"
              subtitle="Segunda pessoa da suíte (casados)"
            />
            {renderParticipantFields(
              suitePartner,
              handleSuitePartnerChange,
              'suite_',
              { isPartner: true },
            )}
          </section>
        )}

        {currentStep === 'responsible' && (
          <section className="p-6 space-y-4">
            <SectionDivider icon="👥" title="Responsável legal" />
            {renderResponsible()}
          </section>
        )}

        <div className="p-6 flex gap-3">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 text-sm font-medium rounded-xl border border-border hover:bg-muted/50"
            >
              ← Voltar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              'Processando...'
            ) : isLastStep ? (
              'Continuar para pagamento →'
            ) : currentStep === 'orientations' ? (
              'Ir para inscrição →'
            ) : (
              'Próximo →'
            )}
          </button>
        </div>

        {error && (
          <div className="px-6 pb-6">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              {error}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
