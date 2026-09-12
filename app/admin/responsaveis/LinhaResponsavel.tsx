"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { UserCog, KeyRound, X } from "lucide-react";
import { ApagarResponsavelBotao } from "./ApagarResponsavelBotao";
import { redefinirPasswordAction, RedefinirPasswordState } from "@/app/actions/responsaveis";
import { Campo } from "@/components/Campo";
import { Botao } from "@/components/Botao";

function BotaoRedefinir() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending} className="shrink-0">
      {pending ? "A guardar..." : "Guardar"}
    </Botao>
  );
}

export function LinhaResponsavel({ id, nome, username }: { id: string; nome: string; username: string }) {
  const [aberto, setAberto] = useState(false);
  const [state, formAction] = useFormState<RedefinirPasswordState, FormData>(
    redefinirPasswordAction,
    null
  );

  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-950/5 text-navy-900">
          <UserCog size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-medium text-navy-950">{nome}</p>
          <p className="text-[13px] text-navy-950/50">@{username}</p>
        </div>
        <button
          onClick={() => setAberto((v) => !v)}
          className="focus-ring flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[12.5px] font-medium text-navy-950/55 hover:bg-navy-950/5"
        >
          {aberto ? <X size={14} /> : <KeyRound size={14} />}
          {aberto ? "Fechar" : "Alterar palavra-passe"}
        </button>
        <ApagarResponsavelBotao id={id} nome={nome} />
      </div>

      {aberto && (
        <form action={formAction} className="mt-3 flex items-start gap-3 pl-14">
          <input type="hidden" name="id" value={id} />
          <div className="flex-1">
            <Campo label="Nova palavra-passe" name="password" type="text" placeholder="mínimo 6 caracteres" />
          </div>
          <div className="pt-6">
            <BotaoRedefinir />
          </div>
          {state?.error && <p className="pt-8 text-[13px] text-red-700">{state.error}</p>}
          {state?.success && <p className="pt-8 text-[13px] text-emerald-700">{state.success}</p>}
        </form>
      )}
    </li>
  );
}
