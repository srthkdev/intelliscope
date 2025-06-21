import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/services/appwrite/client';

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
    
    // This route is called by Appwrite after successful authentication
    // The session is already created by Appwrite, so we just need to redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}