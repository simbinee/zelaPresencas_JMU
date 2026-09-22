import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { TabelaRelatorios } from "./TabelaRelatorios";
import { TurmaBarChart } from "./TurmaBarChart";

const LIMIAR_RISCO = 75;

export default async function RelatoriosPage() {
  const agora = new Date();
  const [candidatos, totalEventos] = await Promise.all([
    prisma.candidato.findMany({
      where: { status: "ATIVO" },
      orderBy: { nome: "asc" },
      include: {
        attendances: {
          where: { presente: true, evento: { data: { lte: agora } } },
        },
        turma: { include: { anoLetivo: true } },
      },
    }),
    prisma.evento.count({ where: { data: { lte: agora } } }),
  ]);

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
  const totalEmDia = linhas.filter((l) => l.percentagem >= 75).length;
  const totalEmAtencao = linhas.filter((l) => l.percentagem >= 40 && l.percentagem < 75).length;
  const totalCriticos = linhas.filter((l) => l.percentagem < 40).length;

  const porTurma = new Map<string, number[]>();
  for (const l of linhas) {
    const chave = l.turma?.nome || "Sem turma";
    if (!porTurma.has(chave)) porTurma.set(chave, []);
    porTurma.get(chave)!.push(l.percentagem);
  }
  const dadosTurma = Array.from(porTurma.entries())
    .map(([turma, valores]) => ({
      turma,
      media: Math.round(valores.reduce((a, b) => a + b, 0) / valores.length),
    }))
    .sort((a, b) => b.media - a.media);
  const melhorTurma = dadosTurma[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
          Relatórios
        </h1>
        <p className="mt-1.5 text-[15px] text-navy-950/55">
          Assiduidade dos candidatos nos eventos que já começaram.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Eventos realizados" valor={totalEventos} />
        <StatCard label="Candidatos ativos" valor={linhas.length} />
        <StatCard label="Assiduidade média" valor={`${mediaGeral}%`} destaque />
        <StatCard
          label={`Em risco (< ${LIMIAR_RISCO}%)`}
          valor={totalEmRisco}
          detalhe={totalEmRisco > 0 ? "podem não cumprir requisitos" : "tudo em dia"}
        />
      </div>

      {linhas.length > 0 && totalEventos > 0 && (
        <section className="overflow-hidden rounded-xl bg-navy-950 text-white">
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-parchment-100/50">
                Leitura executiva
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">Acompanhamento da assiduidade</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-parchment-100/65">
                {totalCriticos > 0
                  ? `${totalCriticos} candidato(s) precisam de atenção imediata; ${totalEmDia} mantêm uma assiduidade de pelo menos 75%.`
                  : `${totalEmDia} candidato(s) mantêm uma assiduidade de pelo menos 75%.`}
                {melhorTurma
                  ? ` A turma ${melhorTurma.turma} apresenta a melhor média neste período.`
                  : ""}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-5 border-t border-white/10 pt-4 lg:min-w-[330px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div>
                <p className="text-2xl font-semibold text-emerald-300">{totalEmDia}</p>
                <p className="mt-1 text-[11.5px] text-parchment-100/50">Em dia</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gold-400">{totalEmAtencao}</p>
                <p className="mt-1 text-[11.5px] text-parchment-100/50">A acompanhar</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-flame-400">{totalCriticos}</p>
                <p className="mt-1 text-[11.5px] text-parchment-100/50">Prioridade</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {linhas.length === 0 || totalEventos === 0 ? (
        <div className="rounded-xl border border-navy-900/10 bg-white px-5 py-10 text-center text-[14px] text-navy-950/45">
          Ainda não há dados suficientes. Depois de um evento começar, regista presenças para veres o relatório aqui.
        </div>
      ) : (
        <>
          {dadosTurma.length > 1 && (
            <div className="rounded-xl border border-navy-900/10 bg-white p-5">
              <h2 className="mb-1 font-display text-lg font-semibold text-navy-950">
                Assiduidade média por turma
              </h2>
              <p className="mb-4 text-[13px] text-navy-950/50">
                Ajuda a identificar que turmas precisam de mais atenção.
              </p>
              <TurmaBarChart dados={dadosTurma} />
            </div>
          )}
          <TabelaRelatorios linhas={linhas} totalEventos={totalEventos} />
        </>
      )}
    </div>
  );
}
