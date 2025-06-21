import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/services/appwrite/server';
import { OAuthProvider } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    // Get the origin for redirect URLs
    const origin = new URL(request.url).origin;
    
    const { account } = await createAdminClient();
    
    // Create OAuth2 session with Google
    // Note: createOAuth2Token generates a redirect URL for OAuth flow
    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google, // Use the enum instead of string
      `${origin}/dashboard`, // Success URL
      `${origin}/login?error=auth_failed` // Failure URL with error parameter
    );
    
    // For server-side environments, redirect to the OAuth URL
    // The redirectUrl contains the Google OAuth authorization URL
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    
    // Return JSON error response instead of redirect for API consistency
    return NextResponse.json(
      { 
        error: 'Failed to initiate Google OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method if you need to handle OAuth initiation via POST
export async function POST(request: NextRequest) {
  // You can add custom logic here, like accepting redirect URLs from request body
  try {
    const body = await request.json();
    const successUrl = body.successUrl || '/dashboard';
    const failureUrl = body.failureUrl || '/login?error=auth_failed';
    
    const origin = new URL(request.url).origin;
    const { account } = await createAdminClient();
    
    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${origin}${successUrl}`,
      `${origin}${failureUrl}`
    );
    
    return NextResponse.json({ 
      message: 'OAuth URL generated',
      redirectUrl 
    });
    
  } catch (error) {
    console.error('Google OAuth POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate Google OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}