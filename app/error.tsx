"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Botao } from "@/components/Botao";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro inesperado na aplicação:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment-50 px-5 py-10">
      <div className="w-full max-w-md rounded-xl border border-navy-900/10 bg-white p-6 text-center shadow-sm">
        <AlertTriangle className="mx-auto text-flame-500" size={28} />
        <h1 className="mt-4 font-display text-xl font-semibold text-navy-950">
          Não foi possível concluir esta operação
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-navy-950/60">
          Ocorreu um problema temporário. Tenta atualizar a página. Se continuar, informa a coordenação.
        </p>
        <Botao onClick={() => reset()} className="mt-5">
          <RefreshCw size={15} /> Tentar novamente
        </Botao>
      </div>
    </main>
  );
}