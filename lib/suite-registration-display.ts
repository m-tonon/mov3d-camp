export type SuiteRowRef = {
  _id: string;
  name?: string;
  registrationNumber?: number | null;
  suiteGroupNumber?: number | null;
  suitePartnerId?: string | null;
  suitePartnerName?: string;
  suiteRole?: string | null;
  isSuiteRegistration?: boolean;
  suitePayerRegistrationNumber?: number | null;
};

type SuiteDisplayInfo = {
  groupNumber: number;
  members: string;
  title: string;
};

function memberLabel(r: SuiteRowRef): string {
  return `${r.name ?? '—'} (#${r.registrationNumber ?? '?'})`;
}

/** Build Suíte #N + member list for every row in a pair (read-only; legacy rows without suiteGroupNumber in DB). */
export function buildSuiteDisplayByRegistrationId(
  rows: SuiteRowRef[],
): Map<string, SuiteDisplayInfo> {
  const byId = new Map(rows.map((r) => [String(r._id), r]));
  const byRegNum = new Map(
    rows
      .filter((r) => r.registrationNumber != null)
      .map((r) => [r.registrationNumber as number, r]),
  );
  const out = new Map<string, SuiteDisplayInfo>();
  const usedPairKeys = new Set<string>();
  const pairs: Array<[SuiteRowRef, SuiteRowRef]> = [];

  for (const r of rows) {
    if (r.suiteRole === 'payer' || (r.isSuiteRegistration && r.suitePartnerId)) {
      const partner = r.suitePartnerId
        ? byId.get(String(r.suitePartnerId))
        : undefined;
      if (partner) pairs.push([r, partner]);
    }
  }

  for (const r of rows) {
    if (r.suiteRole !== 'partner') continue;
    const payer =
      (r.suitePayerRegistrationNumber != null
        ? byRegNum.get(r.suitePayerRegistrationNumber)
        : undefined) ??
      (r.suitePartnerId ? byId.get(String(r.suitePartnerId)) : undefined);
    if (!payer) continue;
    const pairKey = [String(payer._id), String(r._id)].sort().join(':');
    if (usedPairKeys.has(pairKey)) continue;
    pairs.push([payer, r]);
  }

  pairs.sort((a, b) => {
    const minA = Math.min(
      a[0].registrationNumber ?? 999_999,
      a[1].registrationNumber ?? 999_999,
    );
    const minB = Math.min(
      b[0].registrationNumber ?? 999_999,
      b[1].registrationNumber ?? 999_999,
    );
    return minA - minB;
  });

  let legacyGroupCounter = 1;

  for (const [payer, partner] of pairs) {
    const pairKey = [String(payer._id), String(partner._id)].sort().join(':');
    if (usedPairKeys.has(pairKey)) continue;
    usedPairKeys.add(pairKey);

    const groupNumber =
      payer.suiteGroupNumber ??
      partner.suiteGroupNumber ??
      legacyGroupCounter++;

    const members = `${memberLabel(payer)} · ${memberLabel(partner)}`;
    const info: SuiteDisplayInfo = {
      groupNumber,
      members,
      title: `Suíte #${groupNumber}`,
    };
    out.set(String(payer._id), info);
    out.set(String(partner._id), info);
  }

  return out;
}

export function attachSuiteDisplayFields<T extends SuiteRowRef>(
  rows: T[],
): Array<T & { suiteGroupNumber?: number; suiteMembers?: string; suiteDisplayTitle?: string }> {
  const display = buildSuiteDisplayByRegistrationId(rows);
  return rows.map((row) => {
    const info = display.get(String(row._id));
    if (!info) return { ...row };
    return {
      ...row,
      suiteGroupNumber: info.groupNumber,
      suiteMembers: info.members,
      suiteDisplayTitle: info.title,
    };
  }) as Array<T & { suiteGroupNumber?: number; suiteMembers?: string; suiteDisplayTitle?: string }>;
}
