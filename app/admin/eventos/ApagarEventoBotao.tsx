"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { apagarEventoAction } from "@/app/actions/eventos";
import { useToast } from "@/components/Toast";

export function ApagarEventoBotao({ id }: { id: string }) {
  const { mostrarToast } = useToast();
  const [pending, startTransition] = useTransition();

  function apagar() {
    if (!confirm("Apagar este evento e todas as presenças associadas?")) return;

    const formData = new FormData();
    formData.set("id", id);

    startTransition(() => {
      void (async () => {
        try {
          await apagarEventoAction(formData);
          mostrarToast("Evento apagado.", "info");
        } catch {
          mostrarToast("Não foi possível apagar o evento. Tenta novamente.", "erro");
        }
      })();
    });
  }

  return (
    <button
      type="button"
      onClick={apagar}
      disabled={pending}
      className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
      aria-label="Apagar evento"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
