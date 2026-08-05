import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const CounterModel =
  mongoose.models.RegistrationNumberCounter ||
  mongoose.model(
    'RegistrationNumberCounter',
    CounterSchema,
    'registration_seq_v2',
  );

async function nextSequence(key: string, label: string): Promise<number> {
  const counter = await CounterModel.findOneAndUpdate(
    { key },
    {
      $inc: { seq: 1 },
      $setOnInsert: { key },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  if (!counter) {
    throw new Error(`Failed to allocate ${label}`);
  }
  return counter.seq;
}

/** Monotonic human-friendly registration ID (1, 2, 3…). */
export async function getNextRegistrationNumber(): Promise<number> {
  return nextSequence('registration', 'registration number');
}

/** Suíte casal #1, #2… (compartilhado entre pagador e cônjuge). */
export async function getNextSuiteGroupNumber(): Promise<number> {
  return nextSequence('suite', 'suite group number');
}
