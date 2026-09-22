"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { eventoAindaNaoComecou, eventoJaTerminou } from "@/lib/eventos";

async function garantirQuePodeMarcar(eventoId: string) {
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: { data: true, permiteMarcacaoAtrasada: true },
  });
  if (!evento) throw new Error("Evento não encontrado.");

  if (eventoAindaNaoComecou(evento.data)) {
    throw new Error("A marcação de presenças só fica disponível quando a aula começar.");
  }

  const jaPassou = eventoJaTerminou(evento.data);
  if (jaPassou && !evento.permiteMarcacaoAtrasada) {
    throw new Error(
      "Este evento já passou e a marcação de presenças está bloqueada. Pede a um admin para ativar a exceção neste evento."
    );
  }
}

async function garantirRegistosValidos(eventoId: string, candidatoIds: string[]) {
  const [evento, candidatos] = await Promise.all([
    prisma.evento.findUnique({ where: { id: eventoId }, select: { id: true } }),
    prisma.candidato.findMany({ where: { id: { in: candidatoIds } }, select: { id: true } }),
  ]);
  if (!evento || candidatos.length !== new Set(candidatoIds).size) {
    throw new Error("Evento ou candidato inválido.");
  }
}

export async function marcarPresencaAction(
  eventoId: string,
  candidatoId: string,
  presente: boolean,
  observacao?: string
) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Não autorizado.");
    await garantirQuePodeMarcar(eventoId);
    await garantirRegistosValidos(eventoId, [candidatoId]);

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
  } catch (error) {
    console.error("Falha ao marcar presença", { eventoId, candidatoId, error });
    throw error;
  }
}

export async function marcarTodosAction(
  eventoId: string,
  candidatoIds: string[],
  presente: boolean
) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado.");
  if (candidatoIds.length === 0 || candidatoIds.length > 500) {
    throw new Error("Lista de candidatos inválida.");
  }
  await garantirQuePodeMarcar(eventoId);
  await garantirRegistosValidos(eventoId, candidatoIds);

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
  await garantirRegistosValidos(eventoId, [candidatoId]);

  await prisma.attendance.deleteMany({ where: { eventoId, candidatoId } });

  revalidatePath(`/responsavel/eventos/${eventoId}`);
  revalidatePath("/admin/relatorios");
  revalidatePath("/admin");
}
