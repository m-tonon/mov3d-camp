import type { Types } from 'mongoose';
import { RegistrationModel } from '@/shared/models/registration.model';

async function deleteUnpaidRegistrationIfExists(
  id: Types.ObjectId,
): Promise<void> {
  const doc = await RegistrationModel.findById(id);
  if (!doc || doc.payment?.paymentConfirmed) return;
  await RegistrationModel.findByIdAndDelete(id);
}

async function clearSuitePartnerFields(
  registrationId: Types.ObjectId,
): Promise<void> {
  await RegistrationModel.findByIdAndUpdate(registrationId, {
    $unset: { suitePartnerId: '', suitePartnerName: '' },
    $set: { isSuiteRegistration: false },
  });
}

/** Drop suitePartnerId / name when the referenced document no longer exists. */
export async function reconcileStaleSuitePartnerRef(
  registrationId: Types.ObjectId,
): Promise<void> {
  const main = await RegistrationModel.findById(registrationId).select(
    'suitePartnerId',
  );
  if (!main?.suitePartnerId) return;

  const partnerExists = await RegistrationModel.exists({
    _id: main.suitePartnerId,
  });
  if (!partnerExists) {
    await clearSuitePartnerFields(registrationId);
  }
}

/**
 * Main registrant saved as individual: remove unpaid linked partner and clear suite fields.
 */
export async function dissolveSuitePartnerForIndividualMain(
  mainId: Types.ObjectId,
): Promise<void> {
  const main = await RegistrationModel.findById(mainId).select('suitePartnerId');
  if (!main) return;

  if (main.suitePartnerId) {
    const partner = await RegistrationModel.findById(main.suitePartnerId);
    if (partner?.payment?.paymentConfirmed) {
      await RegistrationModel.findByIdAndUpdate(partner._id, {
        $unset: { suitePartnerId: '' },
        $set: { isSuiteRegistration: false },
      });
    } else {
      await deleteUnpaidRegistrationIfExists(main.suitePartnerId);
    }
  }

  await clearSuitePartnerFields(mainId);
}

/** Remove a former suite partner when the main registrant links someone else. */
export async function removeReplacedSuitePartner(
  previousPartnerId: Types.ObjectId | null | undefined,
  newPartnerId: Types.ObjectId,
): Promise<void> {
  if (!previousPartnerId) return;
  if (previousPartnerId.toString() === newPartnerId.toString()) return;
  await deleteUnpaidRegistrationIfExists(previousPartnerId);
}
