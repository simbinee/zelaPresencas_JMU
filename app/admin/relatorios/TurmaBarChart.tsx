"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export function TurmaBarChart({ dados }: { dados: { turma: string; media: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#12203D14" />
        <XAxis
          dataKey="turma"
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
          cursor={{ fill: "#12203D08" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #12203D1a", fontSize: 13 }}
          formatter={(v: number) => [`${v}%`, "Assiduidade média"]}
        />
        <Bar dataKey="media" radius={[4, 4, 0, 0]}>
          {dados.map((d, i) => (
            <Cell key={i} fill={d.media >= 75 ? "#10b981" : d.media >= 40 ? "#B8862B" : "#C1440E"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
