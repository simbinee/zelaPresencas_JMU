"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockOpen, Lock } from "lucide-react";
import { alternarMarcacaoAtrasadaAction } from "@/app/actions/eventos";
import { useToast } from "@/components/Toast";

export function AlternarMarcacaoAtrasada({
  eventoId,
  permiteMarcacaoAtrasadaInicial,
}: {
  eventoId: string;
  permiteMarcacaoAtrasadaInicial: boolean;
}) {
  const [permite, setPermite] = useState(permiteMarcacaoAtrasadaInicial);
  const [pending, startTransition] = useTransition();
  const { mostrarToast } = useToast();
  const router = useRouter();

  function alternar() {
    const novoValor = !permite;
    const anterior = permite;
    setPermite(novoValor);

    startTransition(() => {
      void (async () => {
        try {
          await alternarMarcacaoAtrasadaAction(eventoId, novoValor);
          router.refresh();
          mostrarToast(
            novoValor
              ? "Exceção ativada — já é possível marcar presenças neste evento passado."
              : "Exceção desativada — a marcação de presenças voltou a ficar bloqueada.",
            novoValor ? "sucesso" : "info"
          );
        } catch (error) {
          setPermite(anterior);
          mostrarToast(
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar a exceção. Tenta novamente.",
            "erro"
          );
        }
      })();
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pending}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        permite
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
      }`}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : permite ? (
        <LockOpen size={14} />
      ) : (
        <Lock size={14} />
      )}
      {permite ? "Marcação atrasada permitida" : "Permitir marcação atrasada"}
    </button>
  );
}
