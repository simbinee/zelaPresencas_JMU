import { prisma } from "@/lib/prisma";

/**
 * Todos os anos letivos, do mais recente para o mais antigo, cada um com as
 * suas turmas (e o número de candidatos em cada turma). Usado na página de
 * gestão de turmas.
 */
export async function listarAnosComTurmas() {
  return prisma.anoLetivo.findMany({
    orderBy: { nome: "desc" },
    include: {
      turmas: {
        orderBy: { nome: "asc" },
        include: { _count: { select: { candidatos: true } } },
      },
    },
  });
}

/**
 * Lista plana de turmas (com o respetivo ano letivo) pronta a usar num
 * <select>, ordenada primeiro por ano (mais recente primeiro) e depois por nome.
 */
export async function listarTurmasParaSelecao() {
  return prisma.turma.findMany({
    orderBy: [{ anoLetivo: { nome: "desc" } }, { nome: "asc" }],
    include: { anoLetivo: true },
  });
}

export type TurmaParaSelecao = Awaited<ReturnType<typeof listarTurmasParaSelecao>>[number];
