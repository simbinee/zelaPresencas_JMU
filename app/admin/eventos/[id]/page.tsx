import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { contarPresencasPorCandidato } from "@/lib/contagens";
import { eventoJaTerminou } from "@/lib/eventos";
import { EditarEventoForm } from "./EditarEventoForm";
import { ApagarEventoBotao } from "../ApagarEventoBotao";
import { AlternarMarcacaoAtrasada } from "./AlternarMarcacaoAtrasada";
import { ListaPresenca } from "@/app/responsavel/eventos/[id]/ListaPresenca";
import { ChevronLeft } from "lucide-react";

export default async function AdminEventoDetalhe({ params }: { params: { id: string } }) {
  const evento = await prisma.evento.findUnique({ where: { id: params.id } });
  if (!evento) notFound();

  const [candidatos, totalEventos, presencasPorCandidato] = await Promise.all([
    prisma.candidato.findMany({
      where: { status: "ATIVO" },
      orderBy: { nome: "asc" },
      include: {
        attendances: {
          where: { eventoId: params.id },
          include: { marcadoPor: { select: { nome: true } } },
        },
        turma: { include: { anoLetivo: true } },
      },
    }),
    prisma.evento.count(),
    contarPresencasPorCandidato(),
  ]);

  const eventoJaPassou = eventoJaTerminou(evento.data);
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
      marcadoPorNome: marcacao?.marcadoPor?.nome ?? null,
      marcadoEm: marcacao?.marcadoEm ? marcacao.marcadoEm.toISOString() : null,
    };
  });

  return (
    <div className="space-y-5">
      <Link
        href="/admin/eventos"
        className="focus-ring inline-flex items-center gap-1 text-[13.5px] font-medium text-navy-950/55 hover:text-navy-950"
      >
        <ChevronLeft size={16} /> Voltar aos eventos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-950">{evento.titulo}</h1>
          <p className="mt-1 text-[14px] text-navy-950/55">
            {new Date(evento.data).toLocaleDateString("pt-PT", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {evento.local ? ` · ${evento.local}` : ""}
          </p>
          {evento.descricao && (
            <p className="mt-1.5 max-w-lg text-[13.5px] text-navy-950/50">{evento.descricao}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {eventoJaPassou && (
            <AlternarMarcacaoAtrasada
              eventoId={evento.id}
              permiteMarcacaoAtrasadaInicial={evento.permiteMarcacaoAtrasada}
            />
          )}
          <EditarEventoForm evento={evento} />
          <ApagarEventoBotao id={evento.id} />
        </div>
      </div>

      <p className="text-[13px] font-medium text-navy-950/40">
        Podes marcar ou corrigir presenças diretamente aqui, tal como o responsável.
      </p>

      <ListaPresenca
        eventoId={evento.id}
        candidatosIniciais={candidatosComPresenca}
        totalEventos={totalEventos}
        mostrarAuditoria
        bloqueado={!podeMarcar}
      />
    </div>
  );
}
