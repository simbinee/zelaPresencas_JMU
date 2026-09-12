"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, LoginState } from "@/app/actions/auth";
import { Campo } from "@/components/Campo";
import { Botao } from "@/components/Botao";

function BotaoEntrar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending} className="w-full py-3">
      {pending ? "A entrar..." : "Entrar"}
    </Botao>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Campo
        label="Utilizador"
        name="username"
        autoComplete="username"
        placeholder="ex: responsavel"
        required
      />
      <Campo
        label="Palavra-passe"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <BotaoEntrar />
    </form>
  );
}
