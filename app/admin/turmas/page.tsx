import { listarAnosComTurmas } from "@/lib/turmas";
import { NovoAnoForm } from "./NovoAnoForm";
import { AnoCard } from "./AnoCard";

export default async function TurmasPage() {
  const anos = await listarAnosComTurmas();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
            Anos letivos e turmas
          </h1>
          <p className="mt-1.5 max-w-xl text-[15px] text-navy-950/55">
            Cria um ano letivo por cada ano (ex: 2026/2027, depois 2027/2028) e as turmas
            dentro dele. Alguns anos podem ter só uma turma, outros duas ou três — não há
            problema.
          </p>
        </div>
        <NovoAnoForm />
      </div>

      {anos.length === 0 ? (
        <div className="rounded-xl border border-navy-900/10 bg-white px-5 py-10 text-center text-[14px] text-navy-950/45">
          Ainda não há anos letivos criados. Cria o primeiro para depois poderes criar turmas.
        </div>
      ) : (
        <div className="space-y-4">
          {anos.map((ano) => (
            <AnoCard
              key={ano.id}
              ano={{
                id: ano.id,
                nome: ano.nome,
                atual: ano.atual,
                turmas: ano.turmas.map((t) => ({
                  id: t.id,
                  nome: t.nome,
                  totalCandidatos: t._count.candidatos,
                })),
              }}
              anosParaMover={anos.map((a) => ({ id: a.id, nome: a.nome }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
