import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/services/appwrite/client';
import { z } from 'zod';
import { ID } from 'appwrite';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);
    const user = await account.create(ID.unique(), email, password, name);
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 