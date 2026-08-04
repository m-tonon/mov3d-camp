import type { RegistrationFormData } from '@/shared/registration.interface';
import { RegistrationModel } from '@/shared/models/registration.model';
import { normalizeCpf, formatCpfDisplay } from '@/lib/cpf';
import { normalizeShirtSelection } from '@/lib/shirt-model';

export function prepareRegistrationForDb(
  data: RegistrationFormData,
): RegistrationFormData {
  return {
    ...data,
    cpf: normalizeCpf(data.cpf),
    shirt: normalizeShirtSelection(data.shirt),
  };
}

/** Strip fields that are not stored on the Registration document. */
export function toRegistrationDocumentFields(
  prepared: RegistrationFormData,
): Record<string, unknown> {
  const { suitePartner: _suitePartner, ...stored } = prepared;
  return {
    ...stored,
    shirt: {
      wantsShirt: prepared.shirt.wantsShirt,
      items: prepared.shirt.items.map((item) => ({
        model: item.model,
        size: item.size,
        quantity: item.quantity,
      })),
    },
  };
}

async function saveRegistrationDocument(
  existing: Awaited<ReturnType<typeof RegistrationModel.findOne>>,
  prepared: RegistrationFormData,
  upsertFilter: Record<string, unknown>,
) {
  const fields = toRegistrationDocumentFields(prepared);

  if (existing) {
    existing.set(fields);
    existing.markModified('shirt');
    existing.markModified('shirt.items');
    existing.markModified('stay');
    await existing.save();
    return existing;
  }

  return RegistrationModel.findOneAndUpdate(
    upsertFilter,
    { $set: fields },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );
}

export async function upsertRegistrationByCpf(
  data: RegistrationFormData,
): Promise<
  | { ok: true; doc: NonNullable<Awaited<ReturnType<typeof RegistrationModel.findOne>>> }
  | { ok: false; reason: 'paid' }
> {
  const prepared = prepareRegistrationForDb(data);
  const cpf = prepared.cpf;

  if (cpf.length !== 11) {
    const doc = await saveRegistrationDocument(
      null,
      prepared,
      { 'payment.referenceId': prepared.payment?.referenceId },
    );
    return { ok: true, doc: doc! };
  }

  const existing = await RegistrationModel.findOne({
    $or: [{ cpf }, { cpf: formatCpfDisplay(cpf) }],
  });

  if (existing?.payment?.paymentConfirmed) {
    return { ok: false, reason: 'paid' };
  }

  if (existing) {
    const doc = await saveRegistrationDocument(existing, prepared, {});
    return { ok: true, doc: doc! };
  }

  const doc = await saveRegistrationDocument(
    null,
    prepared,
    { 'payment.referenceId': prepared.payment?.referenceId },
  );
  return { ok: true, doc: doc! };
}
