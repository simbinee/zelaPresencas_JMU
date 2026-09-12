"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function RelatoriosChart({
  dados,
}: {
  dados: { nome: string; presencas: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#12203D14" />
        <XAxis
          dataKey="nome"
          tick={{ fontSize: 12, fill: "#12203D80" }}
          axisLine={{ stroke: "#12203D1f" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#12203D80" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#12203D08" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #12203D1a", fontSize: 13 }}
        />
        <Bar dataKey="presencas" fill="#C1440E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
