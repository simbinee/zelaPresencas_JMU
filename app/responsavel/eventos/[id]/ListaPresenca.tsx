"use client";

import { useState, useTransition } from "react";
import { Check, Search } from "lucide-react";
import { marcarPresencaAction } from "@/app/actions/attendance";

type Candidato = {
  id: string;
  nome: string;
  turma: string | null;
  presente: boolean;
};

export function ListaPresenca({
  eventoId,
  candidatosIniciais,
}: {
  eventoId: string;
  candidatosIniciais: Candidato[];
}) {
  const [candidatos, setCandidatos] = useState(candidatosIniciais);
  const [busca, setBusca] = useState("");
  const [, startTransition] = useTransition();

  const filtrados = candidatos.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPresentes = candidatos.filter((c) => c.presente).length;

  function alternar(id: string) {
    setCandidatos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, presente: !c.presente } : c))
    );
    const alvo = candidatos.find((c) => c.id === id);
    const novoEstado = !alvo?.presente;
    startTransition(() => {
      marcarPresencaAction(eventoId, id, novoEstado);
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
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
        <span className="shrink-0 rounded-full bg-navy-950 px-3.5 py-2 text-[13px] font-medium text-white">
          {totalPresentes}/{candidatos.length}
        </span>
      </div>

      <ul className="divide-y divide-navy-900/8 overflow-hidden rounded-xl border border-navy-900/10 bg-white">
        {filtrados.length === 0 ? (
          <li className="px-5 py-8 text-center text-[14px] text-navy-950/45">
            Nenhum candidato encontrado.
          </li>
        ) : (
          filtrados.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => alternar(c.id)}
                className="focus-ring flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-navy-950/[0.03]"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    c.presente
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-navy-950/20 bg-white"
                  }`}
                >
                  {c.presente && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-navy-950">
                    {c.nome}
                  </span>
                  {c.turma && (
                    <span className="block text-[12.5px] text-navy-950/45">{c.turma}</span>
                  )}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                    c.presente
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-navy-950/5 text-navy-950/45"
                  }`}
                >
                  {c.presente ? "Presente" : "Ausente"}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
