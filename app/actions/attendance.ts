"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function garantirQuePodeMarcar(eventoId: string) {
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: { data: true, permiteMarcacaoAtrasada: true },
  });
  if (!evento) throw new Error("Evento não encontrado.");

  const jaPassou = evento.data.getTime() < Date.now();
  if (jaPassou && !evento.permiteMarcacaoAtrasada) {
    throw new Error(
      "Este evento já passou e a marcação de presenças está bloqueada. Pede a um admin para ativar a exceção neste evento."
    );
  }
}

export async function marcarPresencaAction(
  eventoId: string,
  candidatoId: string,
  presente: boolean,
  observacao?: string
) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado.");
  await garantirQuePodeMarcar(eventoId);

  await prisma.attendance.upsert({
    where: { eventoId_candidatoId: { eventoId, candidatoId } },
    update: { presente, observacao: observacao ?? null, marcadoPorId: session.sub },
    create: {
      eventoId,
      candidatoId,
      presente,
      observacao: observacao ?? null,
      marcadoPorId: session.sub,
    },
  });

  revalidatePath(`/responsavel/eventos/${eventoId}`);
  revalidatePath("/admin/relatorios");
  revalidatePath("/admin");
}

export async function marcarTodosAction(
  eventoId: string,
  candidatoIds: string[],
  presente: boolean
) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado.");
  await garantirQuePodeMarcar(eventoId);

  await prisma.$transaction(
    candidatoIds.map((candidatoId) =>
      prisma.attendance.upsert({
        where: { eventoId_candidatoId: { eventoId, candidatoId } },
        update: { presente, marcadoPorId: session.sub },
        create: { eventoId, candidatoId, presente, marcadoPorId: session.sub },
      })
    )
  );

  revalidatePath(`/responsavel/eventos/${eventoId}`);
  revalidatePath("/admin/relatorios");
  revalidatePath("/admin");
}

export async function removerMarcacaoAction(eventoId: string, candidatoId: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado.");
  await garantirQuePodeMarcar(eventoId);

  await prisma.attendance.deleteMany({ where: { eventoId, candidatoId } });

  revalidatePath(`/responsavel/eventos/${eventoId}`);
  revalidatePath("/admin/relatorios");
  revalidatePath("/admin");
}
