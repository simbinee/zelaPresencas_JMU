"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, CalendarDays, ChevronRight } from "lucide-react";
import { ApagarEventoBotao } from "./ApagarEventoBotao";
import { Paginacao } from "@/components/Paginacao";

const POR_PAGINA = 15;

type Evento = {
  id: string;
  titulo: string;
  local: string | null;
  data: Date;
};

export function ListaEventos({
  eventos,
  contagens,
}: {
  eventos: Evento[];
  contagens: Record<string, number>;
}) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = eventos.filter(
    (e) =>
      e.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (e.local || "").toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    setPagina(1);
  }, [busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-950/35"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Procurar por título ou local..."
          className="focus-ring w-full rounded-md border border-navy-900/15 bg-white py-2 pl-9 pr-3.5 text-[14px] placeholder:text-navy-950/35"
        />
      </div>

      <div className="rounded-xl border border-navy-900/10 bg-white">
        {filtrados.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Nenhum evento encontrado.
          </p>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {visiveis.map((e) => (
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

      <Paginacao
        paginaAtual={paginaSegura}
        totalPaginas={totalPaginas}
        totalItens={filtrados.length}
        onMudarPagina={setPagina}
        itemLabel="eventos"
      />
    </div>
  );
}
