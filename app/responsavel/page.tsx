import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CalendarDays, ChevronRight } from "lucide-react";
import { contarPresencasPorEvento } from "@/lib/contagens";

export default async function ResponsavelEventosPage() {
  const [eventos, totalCandidatos, contagens] = await Promise.all([
    prisma.evento.findMany({ orderBy: { data: "desc" } }),
    prisma.candidato.count({ where: { status: "ATIVO" } }),
    contarPresencasPorEvento(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">Eventos</h1>
        <p className="mt-1.5 text-[15px] text-navy-950/55">
          Escolhe um evento para marcar as presenças dos candidatos.
        </p>
      </div>

      <div className="rounded-xl border border-navy-900/10 bg-white">
        {eventos.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Ainda não há eventos criados pela coordenação.
          </p>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {eventos.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/responsavel/eventos/${e.id}`}
                  className="focus-ring flex items-center gap-4 px-5 py-4 transition-colors hover:bg-navy-950/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-white">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-medium text-navy-950">{e.titulo}</p>
                    <p className="text-[13px] text-navy-950/50">
                      {new Date(e.data).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {e.local ? ` · ${e.local}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-navy-950/5 px-3 py-1 text-[12.5px] font-medium text-navy-950/70">
                    {contagens[e.id] ?? 0}/{totalCandidatos}
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-navy-950/30" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
