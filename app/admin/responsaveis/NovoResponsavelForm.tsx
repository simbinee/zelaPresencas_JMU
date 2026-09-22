"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { criarResponsavelAction, CriarResponsavelState } from "@/app/actions/responsaveis";
import { Campo } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { Plus, X } from "lucide-react";

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A criar..." : "Criar acesso"}
    </Botao>
  );
}

export function NovoResponsavelForm() {
  const [aberto, setAberto] = useState(false);
  const [state, formAction] = useFormState<CriarResponsavelState, FormData>(
    criarResponsavelAction,
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  if (!aberto) {
    return (
      <Botao onClick={() => setAberto(true)} className="shrink-0">
        <Plus size={16} /> Novo responsável
      </Botao>
    );
  }

  return (
    <div className="w-full rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">
          Criar acesso de responsável
        </h3>
        <button
          onClick={() => setAberto(false)}
          className="focus-ring rounded-md p-1 text-navy-950/40 hover:text-navy-950"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <form action={formAction} className="grid gap-4 sm:grid-cols-3">
        <Campo label="Nome completo" name="nome" placeholder="ex: Carlos Muianga" required />
        <Campo label="Utilizador" name="username" placeholder="ex: carlos.m" required />
        <Campo
          label="Palavra-passe"
          name="password"
          type="text"
          placeholder="mínimo 6 caracteres"
          required
        />
        {state?.error && (
          <p className="sm:col-span-3 rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="sm:col-span-3 rounded-md bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {state.success}
          </p>
        )}
        <div className="sm:col-span-3">
          <BotaoCriar />
        </div>
      </form>
    </div>
  );
}
