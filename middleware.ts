import {NextRequest, NextResponse} from 'next/server';

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token exists, allow access
    // (Token was already validated by login API before being set)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
