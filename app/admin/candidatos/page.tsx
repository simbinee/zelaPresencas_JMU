import { prisma } from "@/lib/prisma";
import { listarTurmasParaSelecao } from "@/lib/turmas";
import { NovoCandidatoForm } from "./NovoCandidatoForm";
import { AdicionarVariosForm } from "./AdicionarVariosForm";
import { ListaCandidatos } from "./ListaCandidatos";

export default async function CandidatosPage() {
  const [candidatos, turmas] = await Promise.all([
    prisma.candidato.findMany({
      orderBy: { nome: "asc" },
      include: { turma: { include: { anoLetivo: true } } },
    }),
    listarTurmasParaSelecao(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
          Candidatos
        </h1>
        <p className="mt-1.5 text-[15px] text-navy-950/55">
          Candidatos à envergadura e membros em pleno compromisso acompanhados pelo distrito.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <NovoCandidatoForm turmas={turmas} />
        <AdicionarVariosForm turmas={turmas} />
      </div>

      {candidatos.length === 0 ? (
        <div className="rounded-xl border border-navy-900/10 bg-white px-5 py-10 text-center text-[14px] text-navy-950/45">
          Ainda não há candidatos registados.
        </div>
      ) : (
        <ListaCandidatos candidatos={candidatos} />
      )}
    </div>
  );
}
