"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { atualizarCandidatoAction } from "@/app/actions/candidatos";
import { Campo } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { useToast } from "@/components/Toast";
import { Pencil, X } from "lucide-react";

function BotaoGuardar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A guardar..." : "Guardar alterações"}
    </Botao>
  );
}

export function EditarCandidatoForm({
  candidato,
}: {
  candidato: { id: string; nome: string; contacto: string | null; turma: string | null };
}) {
  const [aberto, setAberto] = useState(false);
  const { mostrarToast } = useToast();

  if (!aberto) {
    return (
      <Botao variant="secondary" onClick={() => setAberto(true)}>
        <Pencil size={14} /> Editar dados
      </Botao>
    );
  }

  return (
    <div className="rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">Editar candidato</h3>
        <button
          onClick={() => setAberto(false)}
          className="focus-ring rounded-md p-1 text-navy-950/40 hover:text-navy-950"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <form
        action={async (fd) => {
          try {
            await atualizarCandidatoAction(fd);
            mostrarToast("Alterações guardadas.", "sucesso");
            setAberto(false);
          } catch {
            mostrarToast("Não foi possível guardar as alterações. Tenta novamente.", "erro");
          }
        }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <input type="hidden" name="id" value={candidato.id} />
        <Campo label="Nome completo" name="nome" defaultValue={candidato.nome} required />
        <Campo label="Contacto" name="contacto" defaultValue={candidato.contacto || ""} />
        <Campo label="Turma / grupo" name="turma" defaultValue={candidato.turma || ""} />
        <div className="sm:col-span-3">
          <BotaoGuardar />
        </div>
      </form>
    </div>
  );
}
