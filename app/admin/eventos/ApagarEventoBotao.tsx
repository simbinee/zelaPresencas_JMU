"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { apagarEventoAction } from "@/app/actions/eventos";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function ApagarEventoBotao({ id }: { id: string }) {
  const { mostrarToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmarAberto, setConfirmarAberto] = useState(false);

  function apagar() {
    const formData = new FormData();
    formData.set("id", id);
    setConfirmarAberto(false);

    startTransition(() => {
      void (async () => {
        try {
          await apagarEventoAction(formData);
          mostrarToast("Evento e todas as presenças associadas foram apagados.", "info");
        } catch {
          mostrarToast(
            "Não foi possível apagar o evento. Verifica a ligação e tenta novamente.",
            "erro"
          );
        }
      })();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmarAberto(true)}
        disabled={pending}
        className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Apagar evento"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
      <ConfirmDialog
        aberto={confirmarAberto}
        titulo="Apagar evento?"
        mensagem="Esta ação apaga o evento e todas as presenças registadas nele. Não será possível recuperar estes dados."
        confirmLabel="Apagar definitivamente"
        cancelarLabel="Manter evento"
        perigo
        onConfirm={apagar}
        onCancel={() => setConfirmarAberto(false)}
      />
    </>
  );
}
