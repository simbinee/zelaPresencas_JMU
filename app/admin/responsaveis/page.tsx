import { prisma } from "@/lib/prisma";
import { NovoResponsavelForm } from "./NovoResponsavelForm";
import { ApagarResponsavelBotao } from "./ApagarResponsavelBotao";
import { UserCog } from "lucide-react";

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
              <li key={r.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-950/5 text-navy-900">
                  <UserCog size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-medium text-navy-950">{r.nome}</p>
                  <p className="text-[13px] text-navy-950/50">@{r.username}</p>
                </div>
                <ApagarResponsavelBotao id={r.id} nome={r.nome} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
