"use client";

import { apagarResponsavelAction } from "@/app/actions/responsaveis";
import { Trash2 } from "lucide-react";

export function ApagarResponsavelBotao({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={apagarResponsavelAction}
      onSubmit={(e) => {
        if (!confirm(`Remover o acesso de ${nome}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600"
        aria-label="Remover responsável"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
