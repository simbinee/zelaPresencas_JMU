"use client";

import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { criarTurmaAction } from "@/app/actions/turmas";
import { useToast } from "@/components/Toast";

export function NovaTurmaForm({ anoLetivoId }: { anoLetivoId: string }) {
  const [nome, setNome] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mostrarToast } = useToast();

  async function adicionar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;

    const fd = new FormData();
    fd.set("nome", nomeAparado);
    fd.set("anoLetivoId", anoLetivoId);

    setPending(true);
    try {
      await criarTurmaAction(fd);
      mostrarToast(`Turma "${nomeAparado}" criada.`, "sucesso");
      setNome("");
      inputRef.current?.focus();
    } catch (erro) {
      mostrarToast(
        erro instanceof Error ? erro.message : "Não foi possível criar a turma.",
        "erro"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void adicionar();
      }}
      className="flex items-center gap-2"
    >
      <input
        ref={inputRef}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da nova turma (ex: Turma 1)"
        disabled={pending}
        className="focus-ring w-full max-w-xs rounded-md border border-navy-900/15 px-2.5 py-1.5 text-[13.5px] placeholder:text-navy-950/35 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={pending || !nome.trim()}
        className="focus-ring flex shrink-0 items-center gap-1 rounded-md border border-navy-900/15 bg-white px-3 py-1.5 text-[12.5px] font-medium text-navy-950/70 hover:bg-navy-950/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        Adicionar turma
      </button>
    </form>
  );
}
