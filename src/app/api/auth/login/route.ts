import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/services/appwrite/client';
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
    
    // Create session
    const session = await account.createSession(email, password);
    
    // Get user data
    const user = await account.get();
    
    // Get additional user data from database
    const userData = await getUserByAppwriteId(user.$id);
    
    // If user doesn't exist in our database yet, create a record
    if (!userData) {
      // This is handled in the auth-store checkSession function
      // We'll just return the Appwrite user for now
    }
    
    return NextResponse.json({ session, user });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}