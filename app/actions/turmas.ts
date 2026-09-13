"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Não autorizado.");
  }
}

function revalidarTudo() {
  revalidatePath("/admin/turmas");
  revalidatePath("/admin/candidatos");
  revalidatePath("/admin/relatorios");
  revalidatePath("/admin");
}

export async function criarAnoLetivoAction(formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const marcarComoAtual = formData.get("atual") === "on";
  if (!nome) throw new Error("Indica o nome do ano letivo (ex: 2026/2027).");

  await prisma.$transaction(async (tx) => {
    if (marcarComoAtual) {
      await tx.anoLetivo.updateMany({ data: { atual: false } });
    }
    try {
      await tx.anoLetivo.create({ data: { nome, atual: marcarComoAtual } });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
        throw new Error(`Já existe um ano letivo chamado "${nome}".`);
      }
      throw erro;
    }
  });

  revalidarTudo();
}

export async function alternarAnoAtualAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.$transaction([
    prisma.anoLetivo.updateMany({ data: { atual: false } }),
    prisma.anoLetivo.update({ where: { id }, data: { atual: true } }),
  ]);

  revalidarTudo();
}

export async function apagarAnoLetivoAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  // Apagar o ano apaga também as suas turmas (onDelete: Cascade); os candidatos
  // dessas turmas não são apagados, apenas ficam sem turma (onDelete: SetNull).
  await prisma.anoLetivo.delete({ where: { id } });

  revalidarTudo();
}

export async function criarTurmaAction(formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const anoLetivoId = String(formData.get("anoLetivoId") || "");
  if (!nome || !anoLetivoId) throw new Error("Indica o nome da turma e o ano letivo.");

  try {
    await prisma.turma.create({ data: { nome, anoLetivoId } });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      throw new Error(`Já existe uma turma chamada "${nome}" nesse ano letivo.`);
    }
    throw erro;
  }

  revalidarTudo();
}

export async function atualizarTurmaAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const anoLetivoId = String(formData.get("anoLetivoId") || "");
  if (!id || !nome || !anoLetivoId) return;

  try {
    await prisma.turma.update({ where: { id }, data: { nome, anoLetivoId } });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      throw new Error(`Já existe uma turma chamada "${nome}" nesse ano letivo.`);
    }
    throw erro;
  }

  revalidarTudo();
}

export async function apagarTurmaAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  // Candidatos desta turma não são apagados, apenas ficam sem turma (onDelete: SetNull).
  await prisma.turma.delete({ where: { id } });

  revalidarTudo();
}
