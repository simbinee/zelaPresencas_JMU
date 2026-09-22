import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "jmu_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET deve ter pelo menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  nome: string;
  role: "ADMIN" | "RESPONSAVEL";
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ nome: payload.nome, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.nome !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "RESPONSAVEL")
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      nome: payload.nome,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
