import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Clear auth_token cookie
  response.cookies.set('auth_token', '', {
    path: '/',
    maxAge: 0,
  });
  
  return response;
}
