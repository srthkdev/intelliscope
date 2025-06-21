import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/services/appwrite/server';
import { getUserByAppwriteId } from '@/lib/services/appwrite/database';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    const { account } = await createAdminClient();
    // Create session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Get user data
    const user = await account.get();
    
    // Get additional user data from database
    const userData = await getUserByAppwriteId(user.$id);
    
    // If user doesn't exist in our database yet, create a record
    if (!userData) {
      // This is handled in the auth-store checkSession function
      // We'll just return the Appwrite user for now
    }
    
    const response = NextResponse.json({ session, user });
    response.cookies.set(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`, session.$id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}