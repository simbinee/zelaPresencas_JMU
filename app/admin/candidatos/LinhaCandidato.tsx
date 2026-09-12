"use client";

import { alternarStatusCandidatoAction, apagarCandidatoAction } from "@/app/actions/candidatos";
import { Trash2 } from "lucide-react";

export function LinhaCandidato({
  id,
  nome,
  contacto,
  turma,
  status,
}: {
  id: string;
  nome: string;
  contacto: string | null;
  turma: string | null;
  status: "ATIVO" | "INATIVO";
}) {
  return (
    <tr className="border-b border-navy-900/8 last:border-0">
      <td className="px-5 py-3.5 text-[14.5px] font-medium text-navy-950">{nome}</td>
      <td className="px-5 py-3.5 text-[14px] text-navy-950/60">{turma || "—"}</td>
      <td className="px-5 py-3.5 text-[14px] text-navy-950/60">{contacto || "—"}</td>
      <td className="px-5 py-3.5">
        <form action={alternarStatusCandidatoAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="statusAtual" value={status} />
          <button
            type="submit"
            className={`focus-ring rounded-full px-2.5 py-1 text-[12.5px] font-medium transition-colors ${
              status === "ATIVO"
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-navy-950/5 text-navy-950/50 hover:bg-navy-950/10"
            }`}
          >
            {status === "ATIVO" ? "Ativo" : "Inativo"}
          </button>
        </form>
      </td>
      <td className="px-5 py-3.5 text-right">
        <form
          action={apagarCandidatoAction}
          onSubmit={(e) => {
            if (!confirm(`Remover ${nome} da lista de candidatos?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600"
            aria-label="Remover candidato"
          >
            <Trash2 size={16} />
          </button>
        </form>
      </td>
    </tr>
  );
}
