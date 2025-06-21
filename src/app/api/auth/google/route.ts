import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/services/appwrite/client';
import { Models } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    // Get the origin for redirect URLs
    const origin = new URL(request.url).origin;
    
    // Create OAuth2 session with Google
    // Using string literal as the first parameter which Appwrite accepts
    await account.createOAuth2Session(
      'google' as any, // Type assertion to bypass TypeScript error
      `${origin}/dashboard`, // Success URL
      `${origin}/login`      // Failure URL
    );
    
    // This code won't execute in browser environment as the user will be redirected
    // But we need to return a response for server-side handling
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}