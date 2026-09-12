import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditarCandidatoForm } from "./EditarCandidatoForm";
import { ChevronLeft, Check, X } from "lucide-react";

export default async function CandidatoDetalhe({ params }: { params: { id: string } }) {
  const candidato = await prisma.candidato.findUnique({ where: { id: params.id } });
  if (!candidato) notFound();

  const [attendances, totalEventos] = await Promise.all([
    prisma.attendance.findMany({
      where: { candidatoId: params.id },
      include: { evento: true },
      orderBy: { evento: { data: "desc" } },
    }),
    prisma.evento.count(),
  ]);

  const totalPresencas = attendances.filter((a) => a.presente).length;
  const percentagem = totalEventos > 0 ? Math.round((totalPresencas / totalEventos) * 100) : 0;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/candidatos"
        className="focus-ring inline-flex items-center gap-1 text-[13.5px] font-medium text-navy-950/55 hover:text-navy-950"
      >
        <ChevronLeft size={16} /> Voltar aos candidatos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-950">{candidato.nome}</h1>
          <p className="mt-1 text-[14px] text-navy-950/55">
            {candidato.turma ? `${candidato.turma}` : "Sem turma"}
            {candidato.contacto ? ` · ${candidato.contacto}` : ""}
          </p>
        </div>
        <EditarCandidatoForm candidato={candidato} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-navy-900/10 bg-white p-4">
          <p className="text-[12.5px] text-navy-950/50">Presenças</p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy-950">
            {totalPresencas}/{totalEventos}
          </p>
        </div>
        <div className="rounded-xl border border-navy-900/10 bg-navy-950 p-4 text-white">
          <p className="text-[12.5px] text-parchment-100/55">Assiduidade</p>
          <p className="mt-1 font-display text-2xl font-semibold">{percentagem}%</p>
        </div>
        <div className="rounded-xl border border-navy-900/10 bg-white p-4">
          <p className="text-[12.5px] text-navy-950/50">Estado</p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy-950">
            {candidato.status === "ATIVO" ? "Ativo" : "Inativo"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-navy-900/10 bg-white">
        <div className="border-b border-navy-900/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-navy-950">
            Histórico de eventos
          </h2>
        </div>
        {attendances.length === 0 ? (
          <p className="px-5 py-8 text-center text-[14px] text-navy-950/45">
            Ainda não há presenças marcadas para este candidato.
          </p>
        ) : (
          <ul className="divide-y divide-navy-900/8">
            {attendances.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    a.presente ? "bg-emerald-100 text-emerald-700" : "bg-flame-50 text-flame-600"
                  }`}
                >
                  {a.presente ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-navy-950">{a.evento.titulo}</p>
                  <p className="text-[12.5px] text-navy-950/45">
                    {new Date(a.evento.data).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {!a.presente && a.observacao && (
                    <p className="mt-1 text-[12.5px] italic text-navy-950/50">
                      "{a.observacao}"
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
