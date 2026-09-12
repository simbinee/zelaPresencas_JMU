import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "jmu_session";

async function verify(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verify(token) : null;

  const isAdminRoute = pathname.startsWith("/admin");
  const isRespRoute = pathname.startsWith("/responsavel");

  if ((isAdminRoute || isRespRoute) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/responsavel", req.url));
  }

  if (isRespRoute && session?.role !== "RESPONSAVEL" && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(
      new URL(session.role === "ADMIN" ? "/admin" : "/responsavel", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/responsavel/:path*", "/login"],
};
