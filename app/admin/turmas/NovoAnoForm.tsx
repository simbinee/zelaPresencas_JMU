"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { criarAnoLetivoAction } from "@/app/actions/turmas";
import { Campo } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { useToast } from "@/components/Toast";
import { Plus, X } from "lucide-react";

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A criar..." : "Criar ano letivo"}
    </Botao>
  );
}

export function NovoAnoForm() {
  const [aberto, setAberto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { mostrarToast } = useToast();

  if (!aberto) {
    return (
      <Botao onClick={() => setAberto(true)} className="shrink-0">
        <Plus size={16} /> Novo ano letivo
      </Botao>
    );
  }

  return (
    <div className="w-full rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">Novo ano letivo</h3>
        <button
          onClick={() => setAberto(false)}
          className="focus-ring rounded-md p-1 text-navy-950/40 hover:text-navy-950"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <form
        ref={formRef}
        action={async (fd) => {
          try {
            await criarAnoLetivoAction(fd);
            mostrarToast(`Ano letivo "${fd.get("nome")}" criado.`, "sucesso");
            formRef.current?.reset();
            setAberto(false);
          } catch (erro) {
            mostrarToast(
              erro instanceof Error ? erro.message : "Não foi possível criar o ano letivo.",
              "erro"
            );
          }
        }}
        className="flex flex-wrap items-end gap-4"
      >
        <div className="min-w-[180px]">
          <Campo label="Nome do ano" name="nome" placeholder="ex: 2027/2028" required />
        </div>
        <label className="mb-2.5 flex items-center gap-2 text-[13.5px] font-medium text-navy-900/80">
          <input type="checkbox" name="atual" className="h-4 w-4 rounded border-navy-900/25" />
          Marcar como ano atual
        </label>
        <BotaoCriar />
      </form>
    </div>
  );
}
