import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const adminPass = process.env.ADMIN_PASS;

  if (!adminPass || password !== adminPass) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
