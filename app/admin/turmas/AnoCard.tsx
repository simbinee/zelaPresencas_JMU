"use client";

import { useState, useTransition } from "react";
import { Star, Trash2, Loader2, ChevronDown, ChevronRight, School } from "lucide-react";
import { alternarAnoAtualAction, apagarAnoLetivoAction } from "@/app/actions/turmas";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TurmaRow } from "./TurmaRow";
import { NovaTurmaForm } from "./NovaTurmaForm";

type Turma = { id: string; nome: string; totalCandidatos: number };
type Ano = { id: string; nome: string; atual: boolean; turmas: Turma[] };

export function AnoCard({
  ano,
  anosParaMover,
}: {
  ano: Ano;
  anosParaMover: { id: string; nome: string }[];
}) {
  const [aberto, setAberto] = useState(ano.atual || ano.turmas.length === 0);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const [pendingAtual, startAtualTransition] = useTransition();
  const [pendingApagar, startApagarTransition] = useTransition();
  const { mostrarToast } = useToast();

  const totalCandidatos = ano.turmas.reduce((acc, t) => acc + t.totalCandidatos, 0);

  function marcarComoAtual() {
    const fd = new FormData();
    fd.set("id", ano.id);
    startAtualTransition(() => {
      void (async () => {
        try {
          await alternarAnoAtualAction(fd);
          mostrarToast(`${ano.nome} marcado como ano atual.`, "sucesso");
        } catch (erro) {
          mostrarToast(
            erro instanceof Error ? erro.message : "Não foi possível marcar como atual.",
            "erro"
          );
        }
      })();
    });
  }

  function apagar() {
    const fd = new FormData();
    fd.set("id", ano.id);
    startApagarTransition(() => {
      void (async () => {
        try {
          await apagarAnoLetivoAction(fd);
          mostrarToast(`${ano.nome} removido.`, "info");
        } catch (erro) {
          mostrarToast(
            erro instanceof Error ? erro.message : "Não foi possível remover o ano letivo.",
            "erro"
          );
        }
      })();
    });
    setConfirmarApagar(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <button
          onClick={() => setAberto((v) => !v)}
          className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left"
        >
          {aberto ? (
            <ChevronDown size={16} className="shrink-0 text-navy-950/40" />
          ) : (
            <ChevronRight size={16} className="shrink-0 text-navy-950/40" />
          )}
          <School size={18} className="shrink-0 text-navy-950/50" />
          <span className="truncate font-display text-[16px] font-semibold text-navy-950">
            {ano.nome}
          </span>
          {ano.atual && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-medium text-emerald-700">
              Ano atual
            </span>
          )}
          <span className="shrink-0 text-[13px] text-navy-950/40">
            {ano.turmas.length} turma(s) · {totalCandidatos} candidato(s)
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {!ano.atual && (
            <button
              onClick={marcarComoAtual}
              disabled={pendingAtual}
              className="focus-ring flex items-center gap-1.5 rounded-md border border-navy-900/15 bg-white px-3 py-1.5 text-[12.5px] font-medium text-navy-950/70 hover:bg-navy-950/[0.03] disabled:opacity-50"
            >
              {pendingAtual ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
              Marcar como atual
            </button>
          )}
          <button
            onClick={() => setConfirmarApagar(true)}
            disabled={pendingApagar}
            className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
            aria-label={`Remover ${ano.nome}`}
          >
            {pendingApagar ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="border-t border-navy-900/8 px-5 py-4">
          {ano.turmas.length === 0 ? (
            <p className="mb-3 text-[13.5px] text-navy-950/45">
              Ainda não há turmas neste ano letivo.
            </p>
          ) : (
            <ul className="mb-3 divide-y divide-navy-900/8 overflow-hidden rounded-lg border border-navy-900/10">
              {ano.turmas.map((turma) => (
                <TurmaRow
                  key={turma.id}
                  turma={turma}
                  anoLetivoId={ano.id}
                  anosParaMover={anosParaMover}
                />
              ))}
            </ul>
          )}
          <NovaTurmaForm anoLetivoId={ano.id} />
        </div>
      )}

      <ConfirmDialog
        aberto={confirmarApagar}
        titulo="Remover ano letivo"
        mensagem={
          ano.turmas.length > 0
            ? `${ano.nome} tem ${ano.turmas.length} turma(s) com ${totalCandidatos} candidato(s) ligado(s). Apagar o ano remove também essas turmas — os candidatos não são apagados, só ficam sem turma. Confirmas?`
            : `Queres mesmo remover ${ano.nome}?`
        }
        confirmLabel="Sim, remover"
        cancelarLabel="Cancelar"
        perigo
        onConfirm={apagar}
        onCancel={() => setConfirmarApagar(false)}
      />
    </div>
  );
}
