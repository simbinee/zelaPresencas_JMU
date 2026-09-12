"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Não autorizado.");
  }
  return session;
}

export async function criarEventoAction(formData: FormData) {
  await requireAdmin();

  const titulo = String(formData.get("titulo") || "").trim();
  const local = String(formData.get("local") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim();
  const dataStr = String(formData.get("data") || "");

  if (!titulo || !dataStr) return;

  await prisma.evento.create({
    data: {
      titulo,
      local: local || null,
      descricao: descricao || null,
      data: new Date(dataStr),
    },
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
  revalidatePath("/responsavel");
}

export async function apagarEventoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.evento.delete({ where: { id } });

  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
  revalidatePath("/responsavel");
}
