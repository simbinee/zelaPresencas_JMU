import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { contarPresencasPorCandidato } from "@/lib/contagens";
import { ListaPresenca } from "./ListaPresenca";
import { ChevronLeft } from "lucide-react";

export default async function MarcarPresencaPage({ params }: { params: { id: string } }) {
  const evento = await prisma.evento.findUnique({ where: { id: params.id } });
  if (!evento) notFound();

  const [candidatos, totalEventos, presencasPorCandidato] = await Promise.all([
    prisma.candidato.findMany({
      where: { status: "ATIVO" },
      orderBy: { nome: "asc" },
      include: { attendances: { where: { eventoId: params.id } } },
    }),
    prisma.evento.count(),
    contarPresencasPorCandidato(),
  ]);

  const eventoJaPassou = evento.data.getTime() < Date.now();
  const podeMarcar = !eventoJaPassou || evento.permiteMarcacaoAtrasada;

  const candidatosComPresenca = candidatos.map((c) => {
    const marcacao = c.attendances[0];
    return {
      id: c.id,
      nome: c.nome,
      turma: c.turma,
      presente: marcacao ? marcacao.presente : null,
      observacao: marcacao?.observacao ?? "",
      totalPresencas: presencasPorCandidato[c.id] ?? 0,
    };
  });

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

      <ListaPresenca
        eventoId={evento.id}
        candidatosIniciais={candidatosComPresenca}
        totalEventos={totalEventos}
        bloqueado={!podeMarcar}
      />
    </div>
  );
}
