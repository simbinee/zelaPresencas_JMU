"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Preenche o utilizador e a palavra-passe." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Credenciais inválidas." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Credenciais inválidas." };
  }

  await createSession({ sub: user.id, nome: user.nome, role: user.role });
  redirect(user.role === "ADMIN" ? "/admin" : "/responsavel");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
