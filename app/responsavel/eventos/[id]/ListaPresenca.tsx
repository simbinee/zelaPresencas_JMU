"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, X, Search, MessageSquarePlus, UserCheck, Lock, Pencil } from "lucide-react";
import { marcarPresencaAction, marcarTodosAction, removerMarcacaoAction } from "@/app/actions/attendance";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

function mensagemDeErro(erro: unknown, fallback: string) {
  return erro instanceof Error && erro.message ? erro.message : fallback;
}

type Candidato = {
  id: string;
  nome: string;
  turma: { id: string; nome: string; anoLetivo: { id: string; nome: string } } | null;
  presente: boolean | null;
  observacao: string;
  totalPresencas: number;
  marcadoPorNome?: string | null;
  marcadoEm?: string | null;
};

type Confirmacao =
  | { tipo: "mudar"; candidatoId: string; nome: string; novoValor: boolean }
  | { tipo: "remover"; candidatoId: string; nome: string }
  | { tipo: "todos"; presente: boolean; quantidade: number }
  | null;

export function ListaPresenca({
  eventoId,
  candidatosIniciais,
  totalEventos,
  mostrarAuditoria = false,
  bloqueado = false,
  bloqueioFuturo = false,
}: {
  eventoId: string;
  candidatosIniciais: Candidato[];
  totalEventos: number;
  mostrarAuditoria?: boolean;
  /** true quando a marcação está bloqueada */
  bloqueado?: boolean;
  /** true quando o evento ainda não começou */
  bloqueioFuturo?: boolean;
}) {
  const [candidatos, setCandidatos] = useState(candidatosIniciais);
  const [busca, setBusca] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);
  const [emEdicaoIds, setEmEdicaoIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const { mostrarToast } = useToast();

  function abrirEdicao(id: string) {
    setEmEdicaoIds((prev) => new Set(prev).add(id));
  }

  function fecharEdicao(id: string) {
    setEmEdicaoIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const anos = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const c of candidatos) {
      if (c.turma) mapa.set(c.turma.anoLetivo.id, c.turma.anoLetivo.nome);
    }
    return Array.from(mapa.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => b.nome.localeCompare(a.nome));
  }, [candidatos]);

  const turmas = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string; anoId: string }>();
    for (const c of candidatos) {
      if (c.turma) mapa.set(c.turma.id, { id: c.turma.id, nome: c.turma.nome, anoId: c.turma.anoLetivo.id });
    }
    return Array.from(mapa.values())
      .filter((t) => !anoSelecionado || t.anoId === anoSelecionado)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [candidatos, anoSelecionado]);

  const filtrados = candidatos.filter((c) => {
    const combinaBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const combinaAno = !anoSelecionado || c.turma?.anoLetivo.id === anoSelecionado;
    const combinaTurma = !turmaSelecionada || c.turma?.id === turmaSelecionada;
    return combinaBusca && combinaAno && combinaTurma;
  });

  const totalPresentes = candidatos.filter((c) => c.presente === true).length;
  const totalAusentes = candidatos.filter((c) => c.presente === false).length;
  const totalNaoMarcados = candidatos.length - totalPresentes - totalAusentes;
  const percentagem =
    candidatos.length > 0 ? Math.round((totalPresentes / candidatos.length) * 100) : 0;

  function aplicarMarcacao(id: string, presente: boolean) {
    const atual = candidatos.find((c) => c.id === id);
    const presenteAnterior = atual?.presente ?? null;
    fecharEdicao(id);
    setCandidatos((prev) => prev.map((c) => (c.id === id ? { ...c, presente } : c)));
    startTransition(() => {
      void (async () => {
        try {
          await marcarPresencaAction(eventoId, id, presente, atual?.observacao || undefined);
          mostrarToast(
            `${atual?.nome ?? "Candidato"} marcado${presente ? " como presente" : " como ausente"}.`,
            "sucesso"
          );
        } catch (erro) {
          setCandidatos((prev) =>
            prev.map((c) => (c.id === id ? { ...c, presente: presenteAnterior } : c))
          );
          mostrarToast(mensagemDeErro(erro, "Não foi possível guardar a marcação. Tenta novamente."), "erro");
        }
      })();
    });
  }

  function aplicarRemocao(id: string) {
    const atual = candidatos.find((c) => c.id === id);
    fecharEdicao(id);
    setCandidatos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, presente: null, observacao: "" } : c))
    );
    startTransition(() => {
      void (async () => {
        try {
          await removerMarcacaoAction(eventoId, id);
          mostrarToast(`Marcação de ${atual?.nome ?? "candidato"} removida.`, "info");
        } catch (erro) {
          setCandidatos((prev) =>
            prev.map((c) =>
              c.id === id ? { ...c, presente: atual?.presente ?? null, observacao: atual?.observacao ?? "" } : c
            )
          );
          mostrarToast(mensagemDeErro(erro, "Não foi possível remover a marcação. Tenta novamente."), "erro");
        }
      })();
    });
  }

  function pedirMarcacao(id: string, novoValor: boolean) {
    if (bloqueado) {
      mostrarToast(
        bloqueioFuturo
          ? "A marcação só fica disponível quando a aula começar."
          : "Este evento já passou. Pede a um admin para ativar a exceção neste evento.",
        "erro"
      );
      return;
    }
    const candidato = candidatos.find((c) => c.id === id);
    if (!candidato) return;

    if (candidato.presente === null) {
      // primeira marcação — aplica logo, sem perguntar
      aplicarMarcacao(id, novoValor);
      return;
    }

    if (candidato.presente === novoValor) {
      // clicar outra vez na mesma opção → perguntar se quer remover a marcação
      setConfirmacao({ tipo: "remover", candidatoId: id, nome: candidato.nome });
    } else {
      // mudar de opção → perguntar se quer mesmo alterar
      setConfirmacao({ tipo: "mudar", candidatoId: id, nome: candidato.nome, novoValor });
    }
  }

  function guardarNota(id: string, observacao: string) {
    if (bloqueado) {
      mostrarToast(
        bloqueioFuturo
          ? "A marcação só fica disponível quando a aula começar."
          : "Este evento já passou. Pede a um admin para ativar a exceção neste evento.",
        "erro"
      );
      return;
    }
    setCandidatos((prev) => prev.map((c) => (c.id === id ? { ...c, observacao } : c)));
    const atual = candidatos.find((c) => c.id === id);
    startTransition(() => {
      void (async () => {
        try {
          await marcarPresencaAction(eventoId, id, atual?.presente ?? false, observacao || undefined);
          mostrarToast("Nota guardada.", "sucesso");
        } catch (erro) {
          mostrarToast(mensagemDeErro(erro, "Não foi possível guardar a nota. Tenta novamente."), "erro");
        }
      })();
    });
  }

  function pedirMarcarTodosVisiveis(presente: boolean) {
    if (bloqueado) {
      mostrarToast(
        bloqueioFuturo
          ? "A marcação só fica disponível quando a aula começar."
          : "Este evento já passou. Pede a um admin para ativar a exceção neste evento.",
        "erro"
      );
      return;
    }
    setConfirmacao({ tipo: "todos", presente, quantidade: filtrados.length });
  }

  function confirmar() {
    if (!confirmacao) return;

    if (confirmacao.tipo === "mudar") {
      aplicarMarcacao(confirmacao.candidatoId, confirmacao.novoValor);
    } else if (confirmacao.tipo === "remover") {
      aplicarRemocao(confirmacao.candidatoId);
    } else if (confirmacao.tipo === "todos") {
      const ids = filtrados.map((c) => c.id);
      const anteriores = candidatos.filter((c) => ids.includes(c.id));
      setCandidatos((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, presente: confirmacao.presente } : c))
      );
      startTransition(() => {
        void (async () => {
          try {
            await marcarTodosAction(eventoId, ids, confirmacao.presente);
            mostrarToast(
              `${ids.length} candidato(s) marcado(s) como ${
                confirmacao.presente ? "presentes" : "ausentes"
              }.`,
              "sucesso"
            );
          } catch (erro) {
            setCandidatos((prev) =>
              prev.map((c) => {
                const original = anteriores.find((a) => a.id === c.id);
                return original ? { ...c, presente: original.presente } : c;
              })
            );
            mostrarToast(
              mensagemDeErro(erro, "Não foi possível aplicar a marcação em massa. Tenta novamente."),
              "erro"
            );
          }
        })();
      });
    }

    setConfirmacao(null);
  }

  return (
    <div className="space-y-4">
      {bloqueado && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <p className="text-[13.5px] leading-snug">
            {bloqueioFuturo
              ? "Esta aula ainda não começou, por isso a marcação de presenças está bloqueada."
              : "Este evento já passou, por isso a marcação de presenças está bloqueada."}
            {!bloqueioFuturo &&
              (mostrarAuditoria
                ? " Usa o botão acima para ativar a exceção neste evento, se precisares de corrigir algo."
                : " Pede a um admin para ativar a exceção neste evento, se precisares de corrigir algo.")}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-navy-900/10 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-4 text-[13px]">
            <span className="font-medium text-emerald-700">{totalPresentes} presentes</span>
            <span className="font-medium text-flame-600">{totalAusentes} ausentes</span>
            <span className="font-medium text-navy-950/40">{totalNaoMarcados} por marcar</span>
          </div>
          <span className="text-[13px] font-medium text-navy-950/60">{percentagem}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-navy-950/8">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${percentagem}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => pedirMarcarTodosVisiveis(true)}
          disabled={bloqueado}
          className="focus-ring rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-50"
        >
          Marcar todos presentes
        </button>
        <button
          onClick={() => pedirMarcarTodosVisiveis(false)}
          disabled={bloqueado}
          className="focus-ring rounded-md border border-navy-900/15 bg-white px-3 py-2 text-[13px] font-medium text-navy-950/60 hover:bg-navy-950/[0.03] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          Marcar todos ausentes
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-950/35"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar candidato..."
            className="focus-ring w-full rounded-md border border-navy-900/15 bg-white py-2.5 pl-9 pr-3.5 text-[14.5px] placeholder:text-navy-950/35"
          />
        </div>
        {anos.length > 1 && (
          <select
            value={anoSelecionado ?? ""}
            onChange={(e) => {
              const novoAno = e.target.value || null;
              setAnoSelecionado(novoAno);
              if (turmaSelecionada) {
                const aindaValida = turmas.some(
                  (t) => t.id === turmaSelecionada && (!novoAno || t.anoId === novoAno)
                );
                if (!aindaValida) setTurmaSelecionada(null);
              }
            }}
            className="focus-ring shrink-0 rounded-md border border-navy-900/15 bg-white py-2.5 px-3 text-[13.5px] text-navy-950/80"
          >
            <option value="">Todos os anos</option>
            {anos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {turmas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTurmaSelecionada(null)}
            className={`focus-ring rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              turmaSelecionada === null
                ? "bg-navy-950 text-white"
                : "bg-navy-950/5 text-navy-950/60 hover:bg-navy-950/10"
            }`}
          >
            Todas as turmas
          </button>
          {turmas.map((t) => (
            <button
              key={t.id}
              onClick={() => setTurmaSelecionada(t.id)}
              className={`focus-ring rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                turmaSelecionada === t.id
                  ? "bg-navy-950 text-white"
                  : "bg-navy-950/5 text-navy-950/60 hover:bg-navy-950/10"
              }`}
            >
              {t.nome}
            </button>
          ))}
        </div>
      )}

      <ul className="divide-y divide-navy-900/8 overflow-hidden rounded-xl border border-navy-900/10 bg-white">
        {filtrados.length === 0 ? (
          <li className="px-5 py-8 text-center text-[14px] text-navy-950/45">
            Nenhum candidato encontrado.
          </li>
        ) : (
          filtrados.map((c) => (
            <li key={c.id} className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-medium text-navy-950">{c.nome}</p>
                  <p className="text-[12px] text-navy-950/45">
                    {c.turma ? `${c.turma.nome} · ` : ""}
                    {c.totalPresencas}/{totalEventos} eventos ao todo
                  </p>
                  {mostrarAuditoria && c.presente !== null && c.marcadoPorNome && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-navy-950/35">
                      <UserCheck size={11} className="shrink-0" />
                      Marcado por {c.marcadoPorNome}
                      {c.marcadoEm
                        ? ` às ${new Date(c.marcadoEm).toLocaleString("pt-PT", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {c.presente === null || emEdicaoIds.has(c.id) ? (
                    <>
                      <button
                        onClick={() => pedirMarcacao(c.id, true)}
                        aria-label="Marcar presente"
                        disabled={bloqueado}
                        className={`focus-ring flex items-center gap-1 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          c.presente === true
                            ? "bg-emerald-600 text-white"
                            : "bg-navy-950/5 text-navy-950/50 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                        Presente
                      </button>
                      <button
                        onClick={() => pedirMarcacao(c.id, false)}
                        aria-label="Marcar ausente"
                        disabled={bloqueado}
                        className={`focus-ring flex items-center gap-1 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          c.presente === false
                            ? "bg-flame-600 text-white"
                            : "bg-navy-950/5 text-navy-950/50 hover:bg-red-50 hover:text-flame-600"
                        }`}
                      >
                        <X size={14} strokeWidth={3} />
                        Ausente
                      </button>
                      {c.presente !== null && (
                        <button
                          onClick={() => fecharEdicao(c.id)}
                          aria-label="Cancelar alteração"
                          className="focus-ring rounded-md p-2 text-navy-950/30 hover:bg-navy-950/5 hover:text-navy-950/60"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span
                        className={`flex items-center gap-1 rounded-md px-2.5 py-2 text-[12.5px] font-medium ${
                          c.presente
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-flame-600"
                        }`}
                      >
                        {c.presente ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <X size={14} strokeWidth={3} />
                        )}
                        {c.presente ? "Presente" : "Ausente"}
                      </span>
                      {!bloqueado && (
                        <button
                          onClick={() => abrirEdicao(c.id)}
                          aria-label="Alterar marcação"
                          className="focus-ring rounded-md p-2 text-navy-950/30 hover:bg-navy-950/5 hover:text-navy-950/60"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {c.presente === false && (
                <div className="mt-2.5 flex items-center gap-1.5 pl-0.5">
                  <MessageSquarePlus size={14} className="shrink-0 text-navy-950/30" />
                  <input
                    defaultValue={c.observacao}
                    placeholder="Motivo da ausência, se souberes (ex: doente, viagem, avisou antes)"
                    onBlur={(e) => guardarNota(c.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    disabled={bloqueado}
                    className="focus-ring w-full rounded-md border border-navy-900/12 bg-navy-950/[0.02] px-2.5 py-1.5 text-[13px] placeholder:text-navy-950/35 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      <ConfirmDialog
        aberto={confirmacao !== null}
        titulo={
          confirmacao?.tipo === "remover"
            ? "Remover marcação"
            : confirmacao?.tipo === "todos"
            ? confirmacao.presente
              ? "Marcar todos como presentes"
              : "Marcar todos como ausentes"
            : "Alterar presença"
        }
        mensagem={
          confirmacao?.tipo === "remover"
            ? `${confirmacao.nome} está marcado(a) — queres voltar a deixar por marcar?`
            : confirmacao?.tipo === "todos"
            ? `Isto vai marcar ${confirmacao.quantidade} candidato(s) como ${
                confirmacao.presente ? "presentes" : "ausentes"
              }, substituindo o que já estava marcado. Confirmas?`
            : confirmacao?.tipo === "mudar"
            ? `${confirmacao.nome} já está marcado(a) como ${
                confirmacao.novoValor ? "ausente" : "presente"
              }. Queres mudar para ${confirmacao.novoValor ? "presente" : "ausente"}?`
            : ""
        }
        confirmLabel="Sim, confirmar"
        cancelarLabel="Cancelar"
        onConfirm={confirmar}
        onCancel={() => setConfirmacao(null)}
      />
    </div>
  );
}
