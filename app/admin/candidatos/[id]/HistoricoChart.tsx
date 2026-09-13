"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function HistoricoChart({
  dados,
}: {
  dados: { nome: string; valor: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={dados} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="nome" hide />
        <YAxis domain={[0, 1]} hide />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #12203D1a", fontSize: 12 }}
          formatter={(v: number) => [v === 1 ? "Presente" : "Ausente", ""]}
          labelFormatter={(l) => l}
        />
        <Area
          type="stepAfter"
          dataKey="valor"
          stroke="#B8862B"
          fill="#B8862B"
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
