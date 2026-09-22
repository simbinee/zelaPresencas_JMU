import { prisma } from "@/lib/prisma";
import { NovoEventoForm } from "./NovoEventoForm";
import { NovoAulasForm } from "./NovoAulasForm";
import { ListaEventos } from "./ListaEventos";
import { contarPresencasPorEvento } from "@/lib/contagens";

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

      <div className="flex flex-wrap gap-3">
        <NovoEventoForm />
        <NovoAulasForm />
      </div>

      {eventos.length === 0 ? (
        <div className="rounded-xl border border-navy-900/10 bg-white px-5 py-10 text-center text-[14px] text-navy-950/45">
          Ainda não criaste nenhum evento.
        </div>
      ) : (
        <ListaEventos eventos={eventos} contagens={contagens} />
      )}
    </div>
  );
}
