"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LinhaCandidato } from "./LinhaCandidato";
import { Paginacao } from "@/components/Paginacao";

const POR_PAGINA = 20;

type Candidato = {
  id: string;
  nome: string;
  contacto: string | null;
  turma: { id: string; nome: string; anoLetivo: { id: string; nome: string } } | null;
  status: "ATIVO" | "INATIVO";
};

export function ListaCandidatos({ candidatos }: { candidatos: Candidato[] }) {
  const [busca, setBusca] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);

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

  // Se mudarmos de ano e a turma escolhida não pertencer a ele, limpa o filtro de turma.
  useEffect(() => {
    if (turmaSelecionada && !turmas.some((t) => t.id === turmaSelecionada)) {
      setTurmaSelecionada(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anoSelecionado]);

  const filtrados = candidatos.filter((c) => {
    const combinaBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const combinaAno = !anoSelecionado || c.turma?.anoLetivo.id === anoSelecionado;
    const combinaTurma = !turmaSelecionada || c.turma?.id === turmaSelecionada;
    return combinaBusca && combinaAno && combinaTurma;
  });

  // Volta à primeira página sempre que o filtro muda a lista.
  useEffect(() => {
    setPagina(1);
  }, [busca, anoSelecionado, turmaSelecionada]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-950/35"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar por nome..."
            className="focus-ring w-full rounded-md border border-navy-900/15 bg-white py-2 pl-9 pr-3.5 text-[14px] placeholder:text-navy-950/35"
          />
        </div>
        {anos.length > 0 && (
          <select
            value={anoSelecionado ?? ""}
            onChange={(e) => setAnoSelecionado(e.target.value || null)}
            className="focus-ring shrink-0 rounded-md border border-navy-900/15 bg-white py-2 px-3 text-[13.5px] text-navy-950/80"
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

      <div className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
        {filtrados.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-navy-950/45">
            Nenhum candidato encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-navy-900/10 bg-navy-950/[0.02]">
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Nome</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Turma</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Contacto</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visiveis.map((c) => (
                  <LinhaCandidato
                    key={c.id}
                    id={c.id}
                    nome={c.nome}
                    contacto={c.contacto}
                    turma={c.turma}
                    status={c.status}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Paginacao
        paginaAtual={paginaSegura}
        totalPaginas={totalPaginas}
        totalItens={filtrados.length}
        onMudarPagina={setPagina}
        itemLabel="candidatos"
      />
    </div>
  );
}
