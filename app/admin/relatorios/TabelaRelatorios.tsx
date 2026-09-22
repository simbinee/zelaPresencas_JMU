"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download } from "lucide-react";

type Linha = {
  id: string;
  nome: string;
  turma: { id: string; nome: string; anoLetivo: { id: string; nome: string } } | null;
  presencas: number;
  percentagem: number;
};

const LIMIAR_RISCO = 75;

export function TabelaRelatorios({
  linhas,
  totalEventos,
}: {
  linhas: Linha[];
  totalEventos: number;
}) {
  const [busca, setBusca] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);

  const anos = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const l of linhas) {
      if (l.turma) mapa.set(l.turma.anoLetivo.id, l.turma.anoLetivo.nome);
    }
    return Array.from(mapa.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => b.nome.localeCompare(a.nome));
  }, [linhas]);

  const turmas = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string; anoId: string }>();
    for (const l of linhas) {
      if (l.turma) mapa.set(l.turma.id, { id: l.turma.id, nome: l.turma.nome, anoId: l.turma.anoLetivo.id });
    }
    return Array.from(mapa.values())
      .filter((t) => !anoSelecionado || t.anoId === anoSelecionado)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [linhas, anoSelecionado]);

  const filtrados = linhas.filter((l) => {
    const combinaBusca = l.nome.toLowerCase().includes(busca.toLowerCase());
    const combinaAno = !anoSelecionado || l.turma?.anoLetivo.id === anoSelecionado;
    const combinaTurma = !turmaSelecionada || l.turma?.id === turmaSelecionada;
    return combinaBusca && combinaAno && combinaTurma;
  });

  function exportarCsv() {
    const cabecalho = ["Nome", "Turma", "Ano letivo", "Presenças", "Eventos realizados", "Assiduidade (%)"];
    const linhasCsv = linhas.map((l) => [
      l.nome,
      l.turma?.nome || "",
      l.turma?.anoLetivo.nome || "",
      String(l.presencas),
      String(totalEventos),
      String(l.percentagem),
    ]);
    const csv = [cabecalho, ...linhasCsv]
      .map((linha) => linha.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-assiduidade-jmu.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
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
        <button
          onClick={exportarCsv}
          className="focus-ring flex shrink-0 items-center gap-1.5 rounded-md border border-navy-900/15 bg-white px-3 py-2 text-[13px] font-medium text-navy-950/70 hover:bg-navy-950/[0.03]"
        >
          <Download size={14} /> Exportar CSV
        </button>
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
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Presenças</th>
                  <th className="px-5 py-3 text-[12.5px] font-medium text-navy-950/45">Assiduidade</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((l) => (
                  <tr key={l.id} className="border-b border-navy-900/8 last:border-0">
                    <td className="px-5 py-3.5 text-[14.5px] font-medium">
                      <Link
                        href={`/admin/candidatos/${l.id}`}
                        className="text-navy-950 hover:text-flame-600 hover:underline"
                      >
                        {l.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] text-navy-950/60">
                      {l.turma ? l.turma.nome : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] text-navy-950/60">
                      {l.presencas} / {totalEventos}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-navy-950/8">
                          <div
                            className={`h-full rounded-full ${
                              l.percentagem >= LIMIAR_RISCO
                                ? "bg-emerald-500"
                                : l.percentagem >= 40
                                ? "bg-gold-500"
                                : "bg-flame-500"
                            }`}
                            style={{ width: `${l.percentagem}%` }}
                          />
                        </div>
                        <span
                          className={`text-[13px] font-medium ${
                            l.percentagem < LIMIAR_RISCO ? "text-flame-600" : "text-navy-950/70"
                          }`}
                        >
                          {l.percentagem}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
