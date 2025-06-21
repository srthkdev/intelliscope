import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/services/appwrite/server';
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
    
    const { account } = await createAdminClient();
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
    const session = await account.createEmailPasswordSession(email, password);
    
    const response = NextResponse.json({ user, session });
    response.cookies.set(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`, session.$id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}