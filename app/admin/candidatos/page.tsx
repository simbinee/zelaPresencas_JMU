import { prisma } from "@/lib/prisma";
import { NovoCandidatoForm } from "./NovoCandidatoForm";
import { LinhaCandidato } from "./LinhaCandidato";

export default async function CandidatosPage() {
  const candidatos = await prisma.candidato.findMany({ orderBy: { nome: "asc" } });

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

      <NovoCandidatoForm />

      <div className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
        {candidatos.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Ainda não há candidatos registados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-navy-900/10 bg-navy-950/[0.02]">
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">
                    Nome
                  </th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">
                    Turma
                  </th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">
                    Contacto
                  </th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">
                    Estado
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {candidatos.map((c) => (
                  <LinhaCandidato
                    key={c.id}
                    id={c.id}
                    nome={c.nome}
                    contacto={c.contacto}
                    turma={c.turma}
                    status={c.status}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
