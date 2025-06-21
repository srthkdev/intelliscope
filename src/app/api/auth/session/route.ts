import { NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/services/appwrite/server';
import { getUserByAppwriteId } from '@/lib/services/appwrite/database';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    // Check for the session cookie with your naming convention
    const sessionCookie = cookieStore.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    let account;
    try {
      ({ account } = await createSessionClient());
    } catch (error: any) {
      console.error('Session client creation error:', error);
      return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }
    
    const appwriteUser = await account.get();
    const userData = await getUserByAppwriteId(appwriteUser.$id);

    return NextResponse.json({ user: appwriteUser, userData });
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}