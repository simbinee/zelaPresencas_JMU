import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { TabelaRelatorios } from "./TabelaRelatorios";

const LIMIAR_RISCO = 75;

export default async function RelatoriosPage() {
  const candidatos = await prisma.candidato.findMany({
    where: { status: "ATIVO" },
    orderBy: { nome: "asc" },
    include: { attendances: { where: { presente: true } } },
  });

  const totalEventos = await prisma.evento.count();

  const linhas = candidatos
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      turma: c.turma,
      presencas: c.attendances.length,
      percentagem: totalEventos > 0 ? Math.round((c.attendances.length / totalEventos) * 100) : 0,
    }))
    .sort((a, b) => b.percentagem - a.percentagem);

  const mediaGeral =
    linhas.length > 0
      ? Math.round(linhas.reduce((acc, l) => acc + l.percentagem, 0) / linhas.length)
      : 0;

  const totalEmRisco = linhas.filter((l) => l.percentagem < LIMIAR_RISCO).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
          Relatórios
        </h1>
        <p className="mt-1.5 text-[15px] text-navy-950/55">
          Assiduidade de cada candidato ao longo de todos os eventos registados.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Eventos considerados" valor={totalEventos} />
        <StatCard label="Candidatos ativos" valor={linhas.length} />
        <StatCard label="Assiduidade média" valor={`${mediaGeral}%`} destaque />
        <StatCard
          label={`Em risco (< ${LIMIAR_RISCO}%)`}
          valor={totalEmRisco}
          detalhe={totalEmRisco > 0 ? "podem não cumprir requisitos" : "tudo em dia"}
        />
      </div>

      {linhas.length === 0 || totalEventos === 0 ? (
        <div className="rounded-xl border border-navy-900/10 bg-white px-5 py-10 text-center text-[14px] text-navy-950/45">
          Ainda não há dados suficientes. Cria eventos e regista presenças para veres o relatório aqui.
        </div>
      ) : (
        <TabelaRelatorios linhas={linhas} totalEventos={totalEventos} />
      )}
    </div>
  );
}
