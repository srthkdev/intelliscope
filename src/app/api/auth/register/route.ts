import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/services/appwrite/client';
import { createUser } from '@/lib/services/appwrite/database';
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
    
    // Create Appwrite account
    const user = await account.create(ID.unique(), email, password, name);
    
    // Create user record in database
    await createUser(user.$id, {
      name,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    // Create session for the user
    const session = await account.createSession(email, password);
    
    return NextResponse.json({ user, session });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}