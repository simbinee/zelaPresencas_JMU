"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { criarEventoAction } from "@/app/actions/eventos";
import { Campo, CampoTexto } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { useToast } from "@/components/Toast";
import { Plus, X } from "lucide-react";

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A criar..." : "Criar evento"}
    </Botao>
  );
}

export function NovoEventoForm() {
  const [aberto, setAberto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { mostrarToast } = useToast();

  if (!aberto) {
    return (
      <Botao onClick={() => setAberto(true)} className="shrink-0">
        <Plus size={16} /> Novo evento
      </Botao>
    );
  }

  return (
    <div className="w-full rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">Novo evento</h3>
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
            await criarEventoAction(fd);
            router.refresh();
            mostrarToast(`Evento "${fd.get("titulo")}" criado com sucesso.`, "sucesso");
            formRef.current?.reset();
            setAberto(false);
          } catch (error) {
            mostrarToast(
              error instanceof Error ? error.message : "Não foi possível criar o evento. Tenta novamente.",
              "erro"
            );
          }
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Campo label="Título" name="titulo" placeholder="ex: Culto de Jovens" required />
        <Campo label="Data e hora" name="data" type="datetime-local" required />
        <Campo label="Local" name="local" placeholder="ex: Igreja Central" />
        <div className="sm:col-span-2">
          <CampoTexto label="Descrição (opcional)" name="descricao" rows={2} />
        </div>
        <div className="sm:col-span-2">
          <BotaoCriar />
        </div>
      </form>
    </div>
  );
}
