import { prisma } from "@/lib/prisma";

/**
 * Devolve um mapa { eventoId: numeroDePresentes } usando groupBy,
 * uma funcionalidade estável do Prisma (evita depender de contagem
 * filtrada em relações aninhadas, que exige versões mais recentes).
 */
export async function contarPresencasPorEvento(): Promise<Record<string, number>> {
  const grupos = await prisma.attendance.groupBy({
    by: ["eventoId"],
    where: { presente: true },
    _count: { _all: true },
  });

  const mapa: Record<string, number> = {};
  for (const g of grupos) {
    mapa[g.eventoId] = g._count._all;
  }
  return mapa;
}
