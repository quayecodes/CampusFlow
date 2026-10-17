import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route access policies mapped by URL prefix to required Role.
 */
const ROLE_ROUTE_POLICIES: Record<string, string> = {
  "/student": "STUDENT",
  "/lecturer": "LECTURER",
  "/dept-admin": "DEPT_ADMIN",
  "/uni-admin": "UNI_ADMIN",
};

/**
 * Maps user roles to their default home dashboard URL.
 */
function getRoleDashboard(role?: string): string {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "LECTURER":
      return "/lecturer";
    case "DEPT_ADMIN":
      return "/dept-admin";
    case "UNI_ADMIN":
      return "/uni-admin";
    default:
      return "/";
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read JWT session token from request cookies
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  // 1. If authenticated user visits /login or /register, redirect to their role dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const destination = getRoleDashboard(userRole);
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // 2. Check protected role route boundaries
  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTE_POLICIES)) {
    if (pathname.startsWith(prefix)) {
      // If unauthenticated, redirect to login with callback URL
      if (!isAuthenticated) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If authenticated but role does not match, redirect to unauthorized
      if (userRole !== requiredRole) {
        const unauthorizedUrl = new URL("/unauthorized", req.url);
        unauthorizedUrl.searchParams.set("requiredRole", requiredRole);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
  }

  return NextResponse.next();
}

/**
 * Apply middleware to protected application routes and auth landing pages.
 */
export const config = {
  matcher: [
    "/student/:path*",
    "/lecturer/:path*",
    "/dept-admin/:path*",
    "/uni-admin/:path*",
    "/login",
    "/register",
  ],
};
