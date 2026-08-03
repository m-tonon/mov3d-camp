import { NextResponse } from 'next/server';
import type { AdminRole } from '@/lib/admin-session';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const adminPass = process.env.ADMIN_PASS;
  const guestPass = process.env.GUEST_PASS;

  let role: AdminRole | null = null;
  if (adminPass && password === adminPass) {
    role = 'admin';
  } else if (guestPass && password === guestPass) {
    role = 'guest';
  }

  if (!role) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ success: true, role });
}
