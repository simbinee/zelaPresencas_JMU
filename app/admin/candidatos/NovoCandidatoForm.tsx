"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { criarCandidatoAction } from "@/app/actions/candidatos";
import { Campo } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { Plus, X } from "lucide-react";

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A adicionar..." : "Adicionar candidato"}
    </Botao>
  );
}

export function NovoCandidatoForm() {
  const [aberto, setAberto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!aberto) {
    return (
      <Botao onClick={() => setAberto(true)} className="shrink-0">
        <Plus size={16} /> Novo candidato
      </Botao>
    );
  }

  return (
    <div className="rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">Novo candidato</h3>
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
          await criarCandidatoAction(fd);
          formRef.current?.reset();
          setAberto(false);
        }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <Campo label="Nome completo" name="nome" placeholder="ex: Ana Cossa" required />
        <Campo label="Contacto" name="contacto" placeholder="ex: 84 000 0000" />
        <Campo label="Turma / grupo" name="turma" placeholder="ex: Turma 2026" />
        <div className="sm:col-span-3">
          <BotaoCriar />
        </div>
      </form>
    </div>
  );
}
