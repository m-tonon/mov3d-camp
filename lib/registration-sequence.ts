import { RegistrationModel } from '@/shared/models/registration.model';

async function nextNumberAfterMax(
  filter: Record<string, unknown>,
  field: 'registrationNumber' | 'suiteGroupNumber',
): Promise<number> {
  const maxDoc = await RegistrationModel.findOne(filter)
    .sort({ [field]: -1 })
    .select(field)
    .lean();

  const max = maxDoc?.[field];
  return typeof max === 'number' && max > 0 ? max + 1 : 1;
}

export async function getNextRegistrationNumber(): Promise<number> {
  return nextNumberAfterMax(
    { registrationNumber: { $exists: true, $ne: null } },
    'registrationNumber',
  );
}

export async function getNextSuiteGroupNumber(): Promise<number> {
  return nextNumberAfterMax(
    { suiteGroupNumber: { $exists: true, $ne: null } },
    'suiteGroupNumber',
  );
}
