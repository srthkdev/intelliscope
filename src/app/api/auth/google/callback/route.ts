import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/services/appwrite/client';
import { createUser, getUserByAppwriteId } from '@/lib/services/appwrite/database';

export async function GET(request: NextRequest) {
  try {
    // Get the URL parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Check for error parameter
    const error = searchParams.get('error');
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
    
    try {
      // Get the current user from the session
      const user = await account.get();
      
      // Check if user exists in our database
      const existingUser = await getUserByAppwriteId(user.$id);
      
      // If user doesn't exist in our database, create a record
      if (!existingUser) {
        await createUser(user.$id, {
          name: user.name,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_provider: 'google'
        });
      }
    } catch (userError) {
      console.error('Error handling user data after Google auth:', userError);
      // Continue with redirect even if there's an error with user data
      // The user is still authenticated with Appwrite
    }
    
    // This route is called by Appwrite after successful authentication
    // The session is already created by Appwrite, so we just need to redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}