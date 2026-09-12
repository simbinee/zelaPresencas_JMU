"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusCandidato } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Não autorizado.");
  }
}

export async function criarCandidatoAction(formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const contacto = String(formData.get("contacto") || "").trim();
  const turma = String(formData.get("turma") || "").trim();

  if (!nome) return;

  await prisma.candidato.create({
    data: { nome, contacto: contacto || null, turma: turma || null },
  });

  revalidatePath("/admin/candidatos");
  revalidatePath("/admin");
}

export async function alternarStatusCandidatoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const statusAtual = String(formData.get("statusAtual") || "");
  if (!id) return;

  await prisma.candidato.update({
    where: { id },
    data: {
      status:
        statusAtual === StatusCandidato.ATIVO
          ? StatusCandidato.INATIVO
          : StatusCandidato.ATIVO,
    },
  });

  revalidatePath("/admin/candidatos");
}

export async function apagarCandidatoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.candidato.delete({ where: { id } });
  revalidatePath("/admin/candidatos");
  revalidatePath("/admin");
}

export async function atualizarCandidatoAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const contacto = String(formData.get("contacto") || "").trim();
  const turma = String(formData.get("turma") || "").trim();

  if (!id || !nome) return;

  await prisma.candidato.update({
    where: { id },
    data: { nome, contacto: contacto || null, turma: turma || null },
  });

  revalidatePath(`/admin/candidatos/${id}`);
  revalidatePath("/admin/candidatos");
}

export type AdicionarVariosState = { error?: string; success?: string } | null;

export async function criarCandidatosEmMassaAction(
  _prev: AdicionarVariosState,
  formData: FormData
): Promise<AdicionarVariosState> {
  await requireAdmin();

  const lista = String(formData.get("lista") || "");
  const turma = String(formData.get("turma") || "").trim();

  const linhas = lista
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  if (linhas.length === 0) {
    return { error: "Cola pelo menos um nome, um por linha." };
  }

  const dados = linhas.map((linha) => {
    const [nome, contacto] = linha.split(",").map((parte) => parte.trim());
    return {
      nome,
      contacto: contacto || null,
      turma: turma || null,
    };
  });

  await prisma.candidato.createMany({ data: dados });

  revalidatePath("/admin/candidatos");
  revalidatePath("/admin");

  return { success: `${dados.length} candidato(s) adicionado(s) com sucesso.` };
}
