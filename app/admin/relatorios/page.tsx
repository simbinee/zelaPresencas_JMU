import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Eventos considerados" valor={totalEventos} />
        <StatCard label="Candidatos ativos" valor={linhas.length} />
        <StatCard label="Assiduidade média" valor={`${mediaGeral}%`} destaque />
      </div>

      <div className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
        {linhas.length === 0 || totalEventos === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Ainda não há dados suficientes. Cria eventos e regista presenças para veres o relatório aqui.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-navy-900/10 bg-navy-950/[0.02]">
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Nome</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Turma</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Presenças</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Assiduidade</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-b border-navy-900/8 last:border-0">
                    <td className="px-5 py-3.5 text-[14.5px] font-medium text-navy-950">{l.nome}</td>
                    <td className="px-5 py-3.5 text-[14px] text-navy-950/60">{l.turma || "—"}</td>
                    <td className="px-5 py-3.5 text-[14px] text-navy-950/60">
                      {l.presencas} / {totalEventos}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-navy-950/8">
                          <div
                            className={`h-full rounded-full ${
                              l.percentagem >= 75
                                ? "bg-emerald-500"
                                : l.percentagem >= 40
                                ? "bg-gold-500"
                                : "bg-flame-500"
                            }`}
                            style={{ width: `${l.percentagem}%` }}
                          />
                        </div>
                        <span className="text-[13px] font-medium text-navy-950/70">
                          {l.percentagem}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
