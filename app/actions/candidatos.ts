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

function normalizarNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function nomeCandidatoJaExiste(nome: string, ignorarId?: string) {
  const candidatos = await prisma.candidato.findMany({
    where: ignorarId ? { id: { not: ignorarId } } : undefined,
    select: { id: true, nome: true },
  });
  return candidatos.some((candidato) => normalizarNome(candidato.nome) === normalizarNome(nome));
}

export async function criarCandidatoAction(formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const contacto = String(formData.get("contacto") || "").trim();
  const turmaId = String(formData.get("turmaId") || "").trim();

  if (!nome) return;

  if (await nomeCandidatoJaExiste(nome)) {
    throw new Error("Já existe um candidato com este nome completo.");
  }

  await prisma.candidato.create({
    data: { nome, contacto: contacto || null, turmaId: turmaId || null },
  });

  revalidatePath("/admin/candidatos");
  revalidatePath("/admin/turmas");
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
  const turmaId = String(formData.get("turmaId") || "").trim();

  if (!id || !nome) return;

  if (await nomeCandidatoJaExiste(nome, id)) {
    throw new Error("Já existe outro candidato com este nome completo.");
  }

  await prisma.candidato.update({
    where: { id },
    data: { nome, contacto: contacto || null, turmaId: turmaId || null },
  });

  revalidatePath(`/admin/candidatos/${id}`);
  revalidatePath("/admin/candidatos");
  revalidatePath("/admin/turmas");
}

export type AdicionarVariosState = { error?: string; success?: string } | null;

export async function criarCandidatosEmMassaAction(
  _prev: AdicionarVariosState,
  formData: FormData
): Promise<AdicionarVariosState> {
  await requireAdmin();

  const lista = String(formData.get("lista") || "");
  const turmaId = String(formData.get("turmaId") || "").trim();

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
      turmaId: turmaId || null,
    };
  });

  const nomes = new Set<string>();
  for (const candidato of dados) {
    const nomeNormalizado = normalizarNome(candidato.nome);
    if (nomes.has(nomeNormalizado) || (await nomeCandidatoJaExiste(candidato.nome))) {
      return { error: `O candidato "${candidato.nome}" já está registado ou aparece duplicado na lista.` };
    }
    nomes.add(nomeNormalizado);
  }

  await prisma.candidato.createMany({ data: dados });

  revalidatePath("/admin/candidatos");
  revalidatePath("/admin/turmas");
  revalidatePath("/admin");

  return { success: `${dados.length} candidato(s) adicionado(s) com sucesso.` };
}
