import { prisma } from "@/lib/prisma";
import { NovoResponsavelForm } from "./NovoResponsavelForm";
import { LinhaResponsavel } from "./LinhaResponsavel";

export default async function ResponsaveisPage() {
  const responsaveis = await prisma.user.findMany({
    where: { role: "RESPONSAVEL" },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
          Responsáveis
        </h1>
        <p className="mt-1.5 text-[15px] text-navy-950/55">
          Pessoas com acesso para marcar presenças nos eventos.
        </p>
      </div>

      <NovoResponsavelForm />

      <div className="rounded-xl border border-navy-900/10 bg-white">
        {responsaveis.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Ainda não criaste nenhum acesso de responsável.
          </p>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {responsaveis.map((r) => (
              <LinhaResponsavel key={r.id} id={r.id} nome={r.nome} username={r.username} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
