"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, Check, X, Users } from "lucide-react";
import { atualizarTurmaAction, apagarTurmaAction } from "@/app/actions/turmas";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Turma = { id: string; nome: string; totalCandidatos: number };

export function TurmaRow({
  turma,
  anoLetivoId,
  anosParaMover,
}: {
  turma: Turma;
  anoLetivoId: string;
  anosParaMover: { id: string; nome: string }[];
}) {
  const [emEdicao, setEmEdicao] = useState(false);
  const [nome, setNome] = useState(turma.nome);
  const [anoDestino, setAnoDestino] = useState(anoLetivoId);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const [pendingGuardar, startGuardarTransition] = useTransition();
  const [pendingApagar, startApagarTransition] = useTransition();
  const { mostrarToast } = useToast();

  function cancelar() {
    setNome(turma.nome);
    setAnoDestino(anoLetivoId);
    setEmEdicao(false);
  }

  function guardar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) {
      mostrarToast("O nome da turma não pode ficar vazio.", "erro");
      return;
    }
    const fd = new FormData();
    fd.set("id", turma.id);
    fd.set("nome", nomeAparado);
    fd.set("anoLetivoId", anoDestino);
    startGuardarTransition(() => {
      void (async () => {
        try {
          await atualizarTurmaAction(fd);
          mostrarToast("Turma atualizada.", "sucesso");
          setEmEdicao(false);
        } catch (erro) {
          mostrarToast(
            erro instanceof Error ? erro.message : "Não foi possível guardar a turma.",
            "erro"
          );
        }
      })();
    });
  }

  function apagar() {
    const fd = new FormData();
    fd.set("id", turma.id);
    startApagarTransition(() => {
      void (async () => {
        try {
          await apagarTurmaAction(fd);
          mostrarToast(`Turma "${turma.nome}" removida.`, "info");
        } catch (erro) {
          mostrarToast(
            erro instanceof Error ? erro.message : "Não foi possível remover a turma.",
            "erro"
          );
        }
      })();
    });
    setConfirmarApagar(false);
  }

  if (emEdicao) {
    return (
      <li className="flex flex-wrap items-center gap-2 px-4 py-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="focus-ring min-w-[140px] flex-1 rounded-md border border-navy-900/15 px-2.5 py-1.5 text-[13.5px]"
          placeholder="Nome da turma"
          autoFocus
        />
        {anosParaMover.length > 1 && (
          <select
            value={anoDestino}
            onChange={(e) => setAnoDestino(e.target.value)}
            className="focus-ring rounded-md border border-navy-900/15 bg-white px-2.5 py-1.5 text-[13px]"
          >
            {anosParaMover.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={guardar}
          disabled={pendingGuardar}
          aria-label="Guardar"
          className="focus-ring rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          {pendingGuardar ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        </button>
        <button
          onClick={cancelar}
          aria-label="Cancelar"
          className="focus-ring rounded-md p-1.5 text-navy-950/40 hover:bg-navy-950/5"
        >
          <X size={15} />
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-navy-950">
        {turma.nome}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-navy-950/45">
        <Users size={12} /> {turma.totalCandidatos}
      </span>
      <button
        onClick={() => setEmEdicao(true)}
        aria-label={`Editar ${turma.nome}`}
        className="focus-ring shrink-0 rounded-md p-1.5 text-navy-950/35 hover:bg-navy-950/5 hover:text-navy-950/70"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => setConfirmarApagar(true)}
        disabled={pendingApagar}
        aria-label={`Remover ${turma.nome}`}
        className="focus-ring shrink-0 rounded-md p-1.5 text-navy-950/35 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        {pendingApagar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>

      <ConfirmDialog
        aberto={confirmarApagar}
        titulo="Remover turma"
        mensagem={
          turma.totalCandidatos > 0
            ? `"${turma.nome}" tem ${turma.totalCandidatos} candidato(s). Eles não são apagados, só ficam sem turma atribuída. Confirmas?`
            : `Queres mesmo remover "${turma.nome}"?`
        }
        confirmLabel="Sim, remover"
        cancelarLabel="Cancelar"
        perigo
        onConfirm={apagar}
        onCancel={() => setConfirmarApagar(false)}
      />
    </li>
  );
}
