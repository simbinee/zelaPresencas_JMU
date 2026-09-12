import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListaPresenca } from "./ListaPresenca";
import { ChevronLeft } from "lucide-react";

export default async function MarcarPresencaPage({ params }: { params: { id: string } }) {
  const evento = await prisma.evento.findUnique({ where: { id: params.id } });
  if (!evento) notFound();

  const candidatos = await prisma.candidato.findMany({
    where: { status: "ATIVO" },
    orderBy: { nome: "asc" },
    include: { attendances: { where: { eventoId: params.id } } },
  });

  const candidatosComPresenca = candidatos.map((c) => ({
    id: c.id,
    nome: c.nome,
    turma: c.turma,
    presente: c.attendances[0]?.presente ?? false,
  }));

  return (
    <div className="space-y-5">
      <Link
        href="/responsavel"
        className="focus-ring inline-flex items-center gap-1 text-[13.5px] font-medium text-navy-950/55 hover:text-navy-950"
      >
        <ChevronLeft size={16} /> Voltar aos eventos
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">{evento.titulo}</h1>
        <p className="mt-1 text-[14px] text-navy-950/55">
          {new Date(evento.data).toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          {evento.local ? ` · ${evento.local}` : ""}
        </p>
      </div>

      <ListaPresenca eventoId={evento.id} candidatosIniciais={candidatosComPresenca} />
    </div>
  );
}
