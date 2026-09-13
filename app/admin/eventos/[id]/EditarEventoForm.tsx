"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { atualizarEventoAction } from "@/app/actions/eventos";
import { Campo, CampoTexto } from "@/components/Campo";
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

function paraDatetimeLocal(data: Date) {
  const d = new Date(data);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function EditarEventoForm({
  evento,
}: {
  evento: {
    id: string;
    titulo: string;
    local: string | null;
    descricao: string | null;
    data: Date;
  };
}) {
  const [aberto, setAberto] = useState(false);
  const { mostrarToast } = useToast();

  if (!aberto) {
    return (
      <Botao variant="secondary" onClick={() => setAberto(true)}>
        <Pencil size={14} /> Editar evento
      </Botao>
    );
  }

  return (
    <div className="rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">Editar evento</h3>
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
            await atualizarEventoAction(fd);
            mostrarToast("Alterações guardadas.", "sucesso");
            setAberto(false);
          } catch {
            mostrarToast("Não foi possível guardar as alterações. Tenta novamente.", "erro");
          }
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={evento.id} />
        <Campo label="Título" name="titulo" defaultValue={evento.titulo} required />
        <Campo
          label="Data e hora"
          name="data"
          type="datetime-local"
          defaultValue={paraDatetimeLocal(evento.data)}
          required
        />
        <Campo label="Local" name="local" defaultValue={evento.local || ""} />
        <div className="sm:col-span-2">
          <CampoTexto
            label="Descrição (opcional)"
            name="descricao"
            rows={2}
            defaultValue={evento.descricao || ""}
          />
        </div>
        <div className="sm:col-span-2">
          <BotaoGuardar />
        </div>
      </form>
    </div>
  );
}
