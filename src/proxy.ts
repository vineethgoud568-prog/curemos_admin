import { NextRequest, NextResponse } from 'next/server';

export function proxy(_request: NextRequest) {
  // const hasToken = request.cookies.get('accessToken')?.name;

  // if (hasToken === undefined || hasToken === null) {
  //   request.nextUrl.pathname = '/auth/login';

  //   return NextResponse.redirect(request.nextUrl);
  // } else {
  //   return NextResponse.next();
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
