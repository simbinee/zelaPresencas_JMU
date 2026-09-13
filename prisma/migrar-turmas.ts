/**
 * Script de migração única: converte a turma em texto livre (coluna antiga
 * "turma", agora lida através de `turmaTextoAntigo`) para o novo sistema de
 * Turma + AnoLetivo.
 *
 * O QUE FAZ:
 * 1. Garante que existe o Ano Letivo atual (ex: "2026/2027"), marcado como atual.
 * 2. Para cada valor distinto de turma em texto (ignorando maiúsculas/minúsculas
 *    e espaços a mais), cria uma Turma dentro desse Ano Letivo.
 * 3. Liga cada Candidato à Turma correspondente através de turmaId.
 *
 * COMO CORRER (depois de "npx prisma db push" com o novo schema):
 *   npx tsx prisma/migrar-turmas.ts
 *
 * É seguro correr mais do que uma vez (é idempotente): candidatos que já
 * tenham turmaId não são alterados, e turmas/anos já existentes são reaproveitados.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function nomeDoAnoLetivoAtual(agora: Date): string {
  // Ano letivo corre de agosto a julho: em set/2026 estamos no ano "2026/2027".
  const ano = agora.getFullYear();
  const mes = agora.getMonth(); // 0 = jan
  const inicio = mes >= 7 ? ano : ano - 1; // agosto = índice 7
  return `${inicio}/${inicio + 1}`;
}

async function main() {
  const nomeAnoAtual = nomeDoAnoLetivoAtual(new Date());

  const anoAtual = await prisma.anoLetivo.upsert({
    where: { nome: nomeAnoAtual },
    update: { atual: true },
    create: { nome: nomeAnoAtual, atual: true },
  });
  console.log(`Ano letivo atual: ${anoAtual.nome} (${anoAtual.id})`);

  const candidatosPorMigrar = await prisma.candidato.findMany({
    where: { turmaId: null, turmaTextoAntigo: { not: null } },
    select: { id: true, turmaTextoAntigo: true },
  });

  if (candidatosPorMigrar.length === 0) {
    console.log("Nada para migrar — todos os candidatos já têm turma nova ou não tinham turma.");
    return;
  }

  // Agrupa por texto normalizado (trim + minúsculas) para não criar turmas duplicadas
  // só porque a capitalização era diferente (ex: "Turma 1" vs "turma 1").
  const porTextoNormalizado = new Map<string, { nomeOriginal: string; candidatoIds: string[] }>();
  for (const c of candidatosPorMigrar) {
    const textoOriginal = (c.turmaTextoAntigo || "").trim();
    if (!textoOriginal) continue;
    const chave = textoOriginal.toLowerCase();
    if (!porTextoNormalizado.has(chave)) {
      porTextoNormalizado.set(chave, { nomeOriginal: textoOriginal, candidatoIds: [] });
    }
    porTextoNormalizado.get(chave)!.candidatoIds.push(c.id);
  }

  let turmasCriadas = 0;
  let candidatosAtualizados = 0;

  for (const { nomeOriginal, candidatoIds } of porTextoNormalizado.values()) {
    const turma = await prisma.turma.upsert({
      where: { anoLetivoId_nome: { anoLetivoId: anoAtual.id, nome: nomeOriginal } },
      update: {},
      create: { nome: nomeOriginal, anoLetivoId: anoAtual.id },
    });
    turmasCriadas++;

    const resultado = await prisma.candidato.updateMany({
      where: { id: { in: candidatoIds } },
      data: { turmaId: turma.id },
    });
    candidatosAtualizados += resultado.count;

    console.log(`  "${nomeOriginal}" → turma ${turma.id} (${candidatoIds.length} candidato(s))`);
  }

  console.log(
    `Concluído: ${turmasCriadas} turma(s) criada(s)/reaproveitada(s), ${candidatosAtualizados} candidato(s) atualizado(s).`
  );
  console.log(
    "Depois de confirmares que os dados ficaram corretos, podes remover o campo " +
      "turmaTextoAntigo do schema.prisma e correr 'npx prisma db push' outra vez " +
      "para eliminar a coluna antiga."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
