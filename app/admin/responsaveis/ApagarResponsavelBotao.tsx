"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { apagarResponsavelAction } from "@/app/actions/responsaveis";
import { useToast } from "@/components/Toast";

export function ApagarResponsavelBotao({ id, nome }: { id: string; nome: string }) {
  const { mostrarToast } = useToast();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function apagar() {
    if (!confirm(`Remover o acesso de ${nome}?`)) return;

    const formData = new FormData();
    formData.set("id", id);

    startTransition(() => {
      void (async () => {
        try {
          await apagarResponsavelAction(formData);
          router.refresh();
          mostrarToast(`Acesso de ${nome} removido.`, "info");
        } catch (error) {
          mostrarToast(
            error instanceof Error
              ? error.message
              : "Não foi possível remover o acesso. Tenta novamente.",
            "erro"
          );
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
      aria-label="Remover responsável"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
