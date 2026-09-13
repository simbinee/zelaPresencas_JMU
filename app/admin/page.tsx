import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { RelatoriosChart } from "./RelatoriosChart";
import { EvolucaoChart } from "./EvolucaoChart";
import { TurmaPieChart } from "./TurmaPieChart";
import { contarPresencasPorEvento } from "@/lib/contagens";
import { CalendarDays, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const agora = new Date();

  const [
    totalCandidatosAtivos,
    totalResponsaveis,
    proximosEventos,
    ultimosEventos,
    contagens,
    totalEventos,
    candidatosPorTurma,
  ] = await Promise.all([
    prisma.candidato.count({ where: { status: "ATIVO" } }),
    prisma.user.count({ where: { role: "RESPONSAVEL" } }),
    prisma.evento.findMany({
      where: { data: { gte: agora } },
      orderBy: { data: "asc" },
      take: 5,
    }),
    prisma.evento.findMany({
      orderBy: { data: "desc" },
      take: 6,
    }),
    contarPresencasPorEvento(),
    prisma.evento.count(),
    prisma.candidato.findMany({
      where: { status: "ATIVO" },
      select: { turma: { select: { nome: true } } },
    }),
  ]);

  const dadosGrafico = [...ultimosEventos]
    .reverse()
    .map((e) => ({
      nome: new Date(e.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
      presencas: contagens[e.id] ?? 0,
    }));

  const dadosEvolucao = [...ultimosEventos]
    .reverse()
    .map((e) => ({
      nome: new Date(e.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
      percentagem:
        totalCandidatosAtivos > 0
          ? Math.round(((contagens[e.id] ?? 0) / totalCandidatosAtivos) * 100)
          : 0,
    }));

  const contagemPorTurma = new Map<string, number>();
  for (const c of candidatosPorTurma) {
    const chave = c.turma?.nome || "Sem turma";
    contagemPorTurma.set(chave, (contagemPorTurma.get(chave) ?? 0) + 1);
  }
  const dadosTurma = Array.from(contagemPorTurma.entries())
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
          Visão geral
        </h1>
        <p className="mt-1.5 text-[15px] text-navy-950/55">
          Acompanhamento dos candidatos à envergadura do distrito de Maputo Norte.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Candidatos ativos" valor={totalCandidatosAtivos} destaque />
        <StatCard label="Eventos registados" valor={totalEventos} />
        <StatCard label="Responsáveis" valor={totalResponsaveis} />
        <StatCard
          label="Próximo evento"
          valor={
            proximosEventos[0]
              ? new Date(proximosEventos[0].data).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
          detalhe={proximosEventos[0]?.titulo}
        />
      </div>

      {dadosGrafico.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-navy-900/10 bg-white p-5">
            <h2 className="mb-1 font-display text-lg font-semibold text-navy-950">
              Presenças por evento
            </h2>
            <p className="mb-4 text-[13px] text-navy-950/50">
              Número de presentes em cada evento recente.
            </p>
            <RelatoriosChart dados={dadosGrafico} />
          </div>

          <div className="rounded-xl border border-navy-900/10 bg-white p-5">
            <h2 className="mb-1 font-display text-lg font-semibold text-navy-950">
              Evolução da assiduidade
            </h2>
            <p className="mb-4 text-[13px] text-navy-950/50">
              Percentagem de presentes face ao total de candidatos ativos.
            </p>
            <EvolucaoChart dados={dadosEvolucao} />
          </div>

          {dadosTurma.length > 1 && (
            <div className="rounded-xl border border-navy-900/10 bg-white p-5 lg:col-span-2">
              <h2 className="mb-1 font-display text-lg font-semibold text-navy-950">
                Candidatos por turma
              </h2>
              <p className="mb-4 text-[13px] text-navy-950/50">
                Como os candidatos ativos estão distribuídos por turma.
              </p>
              <TurmaPieChart dados={dadosTurma} />
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-navy-900/10 bg-white">
        <div className="flex items-center justify-between border-b border-navy-900/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-navy-950">
            Próximos eventos
          </h2>
          <Link
            href="/admin/eventos"
            className="focus-ring flex items-center gap-1 text-[13px] font-medium text-flame-500 hover:text-flame-600"
          >
            Gerir eventos <ArrowRight size={14} />
          </Link>
        </div>
        {proximosEventos.length === 0 ? (
          <p className="px-5 py-8 text-center text-[14px] text-navy-950/45">
            Ainda não há eventos futuros agendados.
          </p>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {proximosEventos.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-950 text-white">
                  <CalendarDays size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-medium text-navy-950">{e.titulo}</p>
                  <p className="text-[13px] text-navy-950/50">
                    {new Date(e.data).toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                    {e.local ? ` · ${e.local}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-navy-950/5 px-3 py-1 text-[12.5px] font-medium text-navy-950/70">
                  {contagens[e.id] ?? 0} presentes
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
