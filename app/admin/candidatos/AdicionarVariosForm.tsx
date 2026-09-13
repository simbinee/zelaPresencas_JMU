"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarCandidatosEmMassaAction, AdicionarVariosState } from "@/app/actions/candidatos";
import { CampoTexto } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { TurmaSelect } from "@/components/TurmaSelect";
import { TurmaParaSelecao } from "@/lib/turmas";
import { ListPlus, X } from "lucide-react";

function BotaoAdicionar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A adicionar..." : "Adicionar todos"}
    </Botao>
  );
}

export function AdicionarVariosForm({ turmas }: { turmas: TurmaParaSelecao[] }) {
  const [aberto, setAberto] = useState(false);
  const [state, formAction] = useFormState<AdicionarVariosState, FormData>(
    criarCandidatosEmMassaAction,
    null
  );

  if (!aberto) {
    return (
      <Botao variant="secondary" onClick={() => setAberto(true)} className="shrink-0">
        <ListPlus size={16} /> Adicionar vários
      </Botao>
    );
  }

  return (
    <div className="w-full rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">
          Adicionar vários candidatos
        </h3>
        <button
          onClick={() => setAberto(false)}
          className="focus-ring rounded-md p-1 text-navy-950/40 hover:text-navy-950"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <form action={formAction} className="space-y-4">
        <CampoTexto
          label="Um nome por linha (podes acrescentar o contacto separado por vírgula: Nome, contacto)"
          name="lista"
          rows={6}
          placeholder={"Ana Cossa\nBruno Matsimbe, 84 000 0000\nCarla Nhassengo"}
          required
        />
        <div className="max-w-xs">
          <TurmaSelect turmas={turmas} label="Turma (aplica-se a todos, opcional)" />
        </div>
        {state?.error && (
          <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
        )}
        {state?.success && (
          <p className="rounded-md bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {state.success}
          </p>
        )}
        <BotaoAdicionar />
      </form>
    </div>
  );
}
