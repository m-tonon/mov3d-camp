import type { RegistrationFormData } from '@/shared/registration.interface';
import { RegistrationModel } from '@/shared/models/registration.model';
import { normalizeCpf, formatCpfDisplay } from '@/lib/cpf';
import { normalizeShirtSelection } from '@/lib/shirt-model';
import { getNextRegistrationNumber } from '@/lib/registration-sequence';

export function prepareRegistrationForDb(
  data: RegistrationFormData,
): RegistrationFormData {
  return {
    ...data,
    cpf: normalizeCpf(data.cpf),
    shirt: normalizeShirtSelection(data.shirt),
  };
}

export function toRegistrationDocumentFields(
  prepared: RegistrationFormData,
): Record<string, unknown> {
  const { suitePartner: _suitePartner, ...stored } = prepared;
  const { registrationNumber: _n, ...rest } = stored as Record<string, unknown>;
  return {
    ...rest,
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

async function applyFieldsAndSave(
  doc: NonNullable<Awaited<ReturnType<typeof RegistrationModel.findOne>>>,
  fields: Record<string, unknown>,
) {
  doc.set(fields);
  doc.markModified('shirt');
  doc.markModified('shirt.items');
  doc.markModified('stay');
  if (doc.registrationNumber == null) {
    doc.registrationNumber = await getNextRegistrationNumber();
  }
  await doc.save();
  return doc;
}

function isDuplicateRegistrationNumberError(error: unknown): boolean {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('code' in error) ||
    error.code !== 11000
  ) {
    return false;
  }
  const keyValue =
    'keyValue' in error && error.keyValue && typeof error.keyValue === 'object'
      ? (error.keyValue as Record<string, unknown>)
      : null;
  return keyValue?.registrationNumber !== undefined;
}

async function insertRegistrationViaUpsert(
  upsertFilter: Record<string, unknown>,
  fields: Record<string, unknown>,
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const registrationNumber = await getNextRegistrationNumber();
    try {
      const doc = await RegistrationModel.findOneAndUpdate(
        upsertFilter,
        {
          $set: fields,
          $setOnInsert: { registrationNumber },
        },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
      );
      if (doc) return doc;
    } catch (error) {
      if (!isDuplicateRegistrationNumberError(error) || attempt === 2) {
        throw error;
      }
    }

    const raced = await RegistrationModel.findOne(upsertFilter);
    if (raced) {
      return applyFieldsAndSave(raced, fields);
    }
  }

  throw new Error('Failed to insert registration after retries');
}

async function saveRegistrationDocument(
  existing: Awaited<ReturnType<typeof RegistrationModel.findOne>>,
  prepared: RegistrationFormData,
  upsertFilter: Record<string, unknown>,
) {
  const fields = toRegistrationDocumentFields(prepared);

  if (existing) {
    return applyFieldsAndSave(existing, fields);
  }

  const matched = await RegistrationModel.findOne(upsertFilter);
  if (matched) {
    return applyFieldsAndSave(matched, fields);
  }

  return insertRegistrationViaUpsert(upsertFilter, fields);
}

function upsertFilterForPrepared(prepared: RegistrationFormData): Record<string, unknown> {
  const cpf = prepared.cpf;
  if (cpf.length === 11) {
    return { cpf };
  }
  return { 'payment.referenceId': prepared.payment?.referenceId };
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
      upsertFilterForPrepared(prepared),
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
    upsertFilterForPrepared(prepared),
  );
  return { ok: true, doc: doc! };
}
