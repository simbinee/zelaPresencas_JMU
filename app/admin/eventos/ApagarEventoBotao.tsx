"use client";

import { apagarEventoAction } from "@/app/actions/eventos";
import { Trash2 } from "lucide-react";

export function ApagarEventoBotao({ id }: { id: string }) {
  return (
    <form
      action={apagarEventoAction}
      onSubmit={(e) => {
        if (!confirm("Apagar este evento e todas as presenças associadas?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600"
        aria-label="Apagar evento"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
