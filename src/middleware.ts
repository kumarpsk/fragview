import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin route protection
    // Allow EDITORs access to the Drydown admin pages, but keep other admin routes ADMIN-only
    if (pathname.startsWith('/admin/drydown')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'EDITOR') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } else if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Editor routes (for future The Drydown CMS)
    if (pathname.startsWith('/editor')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'EDITOR') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // ✅ PUBLIC API ROUTES (No authentication required)
        const publicApiRoutes = [
          '/api/auth',
          '/api/register',              // ✅ ADD THIS LINE
          '/api/verify-email', 
          '/api/search',
          '/api/search/autocomplete',           // ✅ ADDED
          '/api/search/random',                 // ✅ ADDED
          '/api/perfumes/search-similar',       // ✅ ADDED
          '/api/featured',                      // ✅ ADDED
          '/api/stats',                         // ✅ ADDED
          '/api/similar-fragrances',            // ✅ ADDED (GET only - view similar)
          '/api/notifications/count',           // ✅ ADDED (for bell icon)
          '/api/brands/by-letter',              // ✅ ADDED (brands pagination)
        ];

        // Check if pathname starts with any public API route
        if (publicApiRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // ✅ PUBLIC PAGE ROUTES (No authentication required)
        if (
          pathname === '/' ||
          pathname.startsWith('/signin') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/verify-email') ||
          pathname.startsWith('/forgot-password') ||
          pathname.startsWith('/reset-password') ||
          pathname.startsWith('/search') ||
          pathname.startsWith('/brands') ||
          pathname.startsWith('/perfumes') ||
          pathname.startsWith('/u/') ||
          pathname.startsWith('/drydown') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/static') ||
          pathname.startsWith('/contact')
        ) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - Static assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};