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

export async function criarAulasAction(formData: FormData) {
  await requireAdmin();

  const titulo = String(formData.get("titulo") || "").trim();
  const local = String(formData.get("local") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim();
  const dataInicio = String(formData.get("dataInicio") || "");
  const dataFim = String(formData.get("dataFim") || "");
  const hora = String(formData.get("hora") || "13:00");

  if (!titulo || !/^\d{4}-\d{2}-\d{2}$/.test(dataInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(dataFim)) {
    throw new Error("Preenche o título e um período válido.");
  }
  if (!/^\d{2}:\d{2}$/.test(hora)) throw new Error("A hora da aula é inválida.");

  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T23:59:59`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || inicio > fim) {
    throw new Error("O período das aulas é inválido.");
  }
  if (inicio.getDay() !== 0) throw new Error("A data inicial precisa ser um domingo.");

  const datas: Date[] = [];
  const cursor = new Date(`${dataInicio}T${hora}:00`);
  while (cursor <= fim && datas.length <= 40) {
    datas.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  if (datas.length === 0 || datas.length > 40) {
    throw new Error("Escolhe um período de aulas de até 40 domingos.");
  }

  const existentes = await prisma.evento.findMany({
    where: { titulo, data: { in: datas } },
    select: { data: true },
  });
  const datasExistentes = new Set(existentes.map((evento) => evento.data.getTime()));
  const novasDatas = datas.filter((data) => !datasExistentes.has(data.getTime()));

  if (novasDatas.length > 0) {
    await prisma.evento.createMany({
      data: novasDatas.map((data) => ({
        titulo,
        local: local || null,
        descricao: descricao || null,
        data,
        permiteMarcacaoAtrasada: true,
      })),
    });
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
  revalidatePath("/responsavel");
  return novasDatas.length;
}

export async function alternarMarcacaoAtrasadaAction(eventoId: string, permitir: boolean) {
  await requireAdmin();

  await prisma.evento.update({
    where: { id: eventoId },
    data: { permiteMarcacaoAtrasada: permitir },
  });

  revalidatePath(`/admin/eventos/${eventoId}`);
  revalidatePath(`/responsavel/eventos/${eventoId}`);
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

export async function atualizarEventoAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  const local = String(formData.get("local") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim();
  const dataStr = String(formData.get("data") || "");

  if (!id || !titulo || !dataStr) return;

  await prisma.evento.update({
    where: { id },
    data: {
      titulo,
      local: local || null,
      descricao: descricao || null,
      data: new Date(dataStr),
    },
  });

  revalidatePath(`/admin/eventos/${id}`);
  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
  revalidatePath("/responsavel");
}
