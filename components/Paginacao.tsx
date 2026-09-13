"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Paginacao({
  paginaAtual,
  totalPaginas,
  totalItens,
  onMudarPagina,
  itemLabel = "itens",
}: {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  onMudarPagina: (pagina: number) => void;
  itemLabel?: string;
}) {
  if (totalPaginas <= 1) return null;

  // Mostra no máximo 5 números de página, centrados na página atual.
  const paginas: number[] = [];
  let inicio = Math.max(1, paginaAtual - 2);
  let fim = Math.min(totalPaginas, inicio + 4);
  inicio = Math.max(1, fim - 4);
  for (let p = inicio; p <= fim; p++) paginas.push(p);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
      <p className="text-[12.5px] text-navy-950/45">{totalItens} {itemLabel} ao todo</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          aria-label="Página anterior"
          className="focus-ring rounded-md p-1.5 text-navy-950/50 hover:bg-navy-950/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        {inicio > 1 && (
          <>
            <button
              onClick={() => onMudarPagina(1)}
              className="focus-ring min-w-[28px] rounded-md px-1.5 py-1 text-[13px] font-medium text-navy-950/60 hover:bg-navy-950/5"
            >
              1
            </button>
            <span className="px-0.5 text-navy-950/30">…</span>
          </>
        )}
        {paginas.map((p) => (
          <button
            key={p}
            onClick={() => onMudarPagina(p)}
            aria-current={p === paginaAtual ? "page" : undefined}
            className={`focus-ring min-w-[28px] rounded-md px-1.5 py-1 text-[13px] font-medium transition-colors ${
              p === paginaAtual
                ? "bg-navy-950 text-white"
                : "text-navy-950/60 hover:bg-navy-950/5"
            }`}
          >
            {p}
          </button>
        ))}
        {fim < totalPaginas && (
          <>
            <span className="px-0.5 text-navy-950/30">…</span>
            <button
              onClick={() => onMudarPagina(totalPaginas)}
              className="focus-ring min-w-[28px] rounded-md px-1.5 py-1 text-[13px] font-medium text-navy-950/60 hover:bg-navy-950/5"
            >
              {totalPaginas}
            </button>
          </>
        )}
        <button
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          aria-label="Próxima página"
          className="focus-ring rounded-md p-1.5 text-navy-950/50 hover:bg-navy-950/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
