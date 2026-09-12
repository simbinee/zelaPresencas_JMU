"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, X, Search, MessageSquarePlus } from "lucide-react";
import { marcarPresencaAction, marcarTodosAction } from "@/app/actions/attendance";

type Candidato = {
  id: string;
  nome: string;
  turma: string | null;
  presente: boolean | null;
  observacao: string;
  totalPresencas: number;
};

export function ListaPresenca({
  eventoId,
  candidatosIniciais,
  totalEventos,
}: {
  eventoId: string;
  candidatosIniciais: Candidato[];
  totalEventos: number;
}) {
  const [candidatos, setCandidatos] = useState(candidatosIniciais);
  const [busca, setBusca] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const turmas = useMemo(() => {
    const unicas = new Set(
      candidatos.map((c) => c.turma).filter((t): t is string => Boolean(t))
    );
    return Array.from(unicas).sort();
  }, [candidatos]);

  const filtrados = candidatos.filter((c) => {
    const combinaBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const combinaTurma = !turmaSelecionada || c.turma === turmaSelecionada;
    return combinaBusca && combinaTurma;
  });

  const totalPresentes = candidatos.filter((c) => c.presente === true).length;
  const totalAusentes = candidatos.filter((c) => c.presente === false).length;
  const totalNaoMarcados = candidatos.length - totalPresentes - totalAusentes;
  const percentagem =
    candidatos.length > 0 ? Math.round((totalPresentes / candidatos.length) * 100) : 0;

  function marcar(id: string, presente: boolean) {
    setCandidatos((prev) => prev.map((c) => (c.id === id ? { ...c, presente } : c)));
    startTransition(() => {
      const atual = candidatos.find((c) => c.id === id);
      marcarPresencaAction(eventoId, id, presente, atual?.observacao || undefined);
    });
  }

  function guardarNota(id: string, observacao: string) {
    setCandidatos((prev) => prev.map((c) => (c.id === id ? { ...c, observacao } : c)));
    const atual = candidatos.find((c) => c.id === id);
    startTransition(() => {
      marcarPresencaAction(eventoId, id, atual?.presente ?? false, observacao || undefined);
    });
  }

  function marcarTodosVisiveis(presente: boolean) {
    const ids = filtrados.map((c) => c.id);
    setCandidatos((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, presente } : c))
    );
    startTransition(() => {
      marcarTodosAction(eventoId, ids, presente);
    });
  }

  return (
    <div className="space-y-4">
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
          onClick={() => marcarTodosVisiveis(true)}
          className="focus-ring rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700 hover:bg-emerald-100"
        >
          Marcar todos presentes
        </button>
        <button
          onClick={() => marcarTodosVisiveis(false)}
          className="focus-ring rounded-md border border-navy-900/15 bg-white px-3 py-2 text-[13px] font-medium text-navy-950/60 hover:bg-navy-950/[0.03]"
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
              key={t}
              onClick={() => setTurmaSelecionada(t)}
              className={`focus-ring rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                turmaSelecionada === t
                  ? "bg-navy-950 text-white"
                  : "bg-navy-950/5 text-navy-950/60 hover:bg-navy-950/10"
              }`}
            >
              {t}
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
                    {c.turma ? `${c.turma} · ` : ""}
                    {c.totalPresencas}/{totalEventos} eventos ao todo
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => marcar(c.id, true)}
                    aria-label="Marcar presente"
                    className={`focus-ring flex items-center gap-1 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
                      c.presente === true
                        ? "bg-emerald-600 text-white"
                        : "bg-navy-950/5 text-navy-950/50 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                    Presente
                  </button>
                  <button
                    onClick={() => marcar(c.id, false)}
                    aria-label="Marcar ausente"
                    className={`focus-ring flex items-center gap-1 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
                      c.presente === false
                        ? "bg-flame-600 text-white"
                        : "bg-navy-950/5 text-navy-950/50 hover:bg-red-50 hover:text-flame-600"
                    }`}
                  >
                    <X size={14} strokeWidth={3} />
                    Ausente
                  </button>
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
                    className="focus-ring w-full rounded-md border border-navy-900/12 bg-navy-950/[0.02] px-2.5 py-1.5 text-[13px] placeholder:text-navy-950/35"
                  />
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
