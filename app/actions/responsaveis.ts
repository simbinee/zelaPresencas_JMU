"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Role } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Não autorizado.");
  }
}

function normalizarNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export type CriarResponsavelState = { error?: string; success?: string } | null;

export async function criarResponsavelAction(
  _prev: CriarResponsavelState,
  formData: FormData
): Promise<CriarResponsavelState> {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!nome || !username || !password) {
    return { error: "Preenche todos os campos." };
  }

  const responsaveis = await prisma.user.findMany({
    where: { role: Role.RESPONSAVEL },
    select: { nome: true },
  });
  if (responsaveis.some((responsavel) => normalizarNome(responsavel.nome) === normalizarNome(nome))) {
    return { error: "Já existe um responsável com este nome completo." };
  }
  if (password.length < 6) {
    return { error: "A palavra-passe deve ter pelo menos 6 caracteres." };
  }

  const existente = await prisma.user.findUnique({ where: { username } });
  if (existente) {
    return { error: "Já existe um utilizador com esse nome de utilizador." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { nome, username, passwordHash, role: Role.RESPONSAVEL },
  });

  revalidatePath("/admin/responsaveis");
  return { success: `Responsável "${nome}" criado com sucesso.` };
}

export async function apagarResponsavelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/responsaveis");
}

export type RedefinirPasswordState = { error?: string; success?: string } | null;

export async function redefinirPasswordAction(
  _prev: RedefinirPasswordState,
  formData: FormData
): Promise<RedefinirPasswordState> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");

  if (!id || !password) {
    return { error: "Escreve a nova palavra-passe." };
  }
  if (password.length < 6) {
    return { error: "A palavra-passe deve ter pelo menos 6 caracteres." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  return { success: "Palavra-passe atualizada." };
}
