"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function EvolucaoChart({ dados }: { dados: { nome: string; percentagem: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={dados} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#12203D14" />
        <XAxis
          dataKey="nome"
          tick={{ fontSize: 12, fill: "#12203D80" }}
          axisLine={{ stroke: "#12203D1f" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#12203D80" }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #12203D1a", fontSize: 13 }}
          formatter={(v: number) => [`${v}%`, "Assiduidade"]}
        />
        <Line
          type="monotone"
          dataKey="percentagem"
          stroke="#B8862B"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#B8862B" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
