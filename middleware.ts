import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Coming Soon bypass için cookie kontrolü
  const adminCookie = request.cookies.get('emlaxai-admin');
  const passParam = searchParams.get('pass');

  // Admin şifresi
  const ADMIN_PASS = 'emlax2026'; // İstersen değiştir!

  // Eğer şifre parametresi doğruysa, cookie set et
  if (passParam === ADMIN_PASS) {
    const response = NextResponse.next();
    response.cookies.set('emlaxai-admin', 'true', {
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      httpOnly: true,
      sameSite: 'strict'
    });
    return response;
  }

  // Admin değilse ve coming-soon sayfasında değilse, coming-soon'a yönlendir
  if (!adminCookie && pathname !== '/coming-soon') {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  // Supabase session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
