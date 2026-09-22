"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { criarAulasAction } from "@/app/actions/eventos";
import { Campo, CampoTexto } from "@/components/Campo";
import { Botao } from "@/components/Botao";
import { useToast } from "@/components/Toast";
import { CalendarRange, Plus, X } from "lucide-react";

function BotaoCriarAulas() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "A criar aulas..." : "Criar aulas"}
    </Botao>
  );
}

export function NovoAulasForm() {
  const [aberto, setAberto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { mostrarToast } = useToast();

  if (!aberto) {
    return (
      <Botao variant="secondary" onClick={() => setAberto(true)} className="shrink-0">
        <CalendarRange size={16} /> Aulas semanais
      </Botao>
    );
  }

  return (
    <div className="w-full rounded-xl border border-navy-900/10 bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950">Criar aulas semanais</h3>
        <button
          onClick={() => setAberto(false)}
          className="focus-ring rounded-md p-1 text-navy-950/40 hover:text-navy-950"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <p className="mb-4 text-[13.5px] text-navy-950/55">
        Será criado um evento para cada domingo do período. A hora serve apenas para organizar a aula;
        a presença não controla a hora de chegada.
      </p>
      <form
        ref={formRef}
        action={async (fd) => {
          try {
            const total = await criarAulasAction(fd);
            router.refresh();
            mostrarToast(
              total > 0 ? `${total} aulas criadas com sucesso.` : "Essas aulas já estavam criadas.",
              "sucesso"
            );
            formRef.current?.reset();
            setAberto(false);
          } catch (error) {
            mostrarToast(error instanceof Error ? error.message : "Não foi possível criar as aulas.", "erro");
          }
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Campo label="Título" name="titulo" defaultValue="Aula JMU" required />
        <Campo label="Hora de início" name="hora" type="time" defaultValue="13:00" required />
        <Campo label="Primeiro domingo" name="dataInicio" type="date" defaultValue="2026-09-20" required />
        <Campo label="Último domingo" name="dataFim" type="date" defaultValue="2027-03-14" required />
        <Campo label="Local" name="local" placeholder="ex: Igreja Central" />
        <div className="sm:col-span-2">
          <CampoTexto label="Descrição (opcional)" name="descricao" rows={2} />
        </div>
        <div className="sm:col-span-2">
          <BotaoCriarAulas />
        </div>
      </form>
    </div>
  );
}