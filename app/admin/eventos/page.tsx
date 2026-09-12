import { prisma } from "@/lib/prisma";
import { NovoEventoForm } from "./NovoEventoForm";
import { ApagarEventoBotao } from "./ApagarEventoBotao";
import { CalendarDays, ChevronRight } from "lucide-react";
import { contarPresencasPorEvento } from "@/lib/contagens";
import Link from "next/link";

export default async function EventosPage() {
  const [eventos, contagens] = await Promise.all([
    prisma.evento.findMany({ orderBy: { data: "desc" } }),
    contarPresencasPorEvento(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-950 lg:text-3xl">
            Eventos
          </h1>
          <p className="mt-1.5 text-[15px] text-navy-950/55">
            Cultos, encontros e formações onde a presença é registada.
          </p>
        </div>
      </div>

      <NovoEventoForm />

      <div className="rounded-xl border border-navy-900/10 bg-white">
        {eventos.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Ainda não criaste nenhum evento.
          </p>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {eventos.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-5 py-4">
                <Link
                  href={`/admin/eventos/${e.id}`}
                  className="focus-ring flex min-w-0 flex-1 items-center gap-4 rounded-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-white">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-medium text-navy-950">{e.titulo}</p>
                    <p className="text-[13px] text-navy-950/50">
                      {new Date(e.data).toLocaleString("pt-PT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {e.local ? ` · ${e.local}` : ""}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-navy-950/25" />
                </Link>
                <span className="shrink-0 rounded-full bg-navy-950/5 px-3 py-1 text-[12.5px] font-medium text-navy-950/70">
                  {contagens[e.id] ?? 0} presentes
                </span>
                <ApagarEventoBotao id={e.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
