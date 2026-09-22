"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { alternarStatusCandidatoAction, apagarCandidatoAction } from "@/app/actions/candidatos";
import { useToast } from "@/components/Toast";

export function LinhaCandidato({
  id,
  nome,
  contacto,
  turma,
  status,
}: {
  id: string;
  nome: string;
  contacto: string | null;
  turma: { id: string; nome: string; anoLetivo: { id: string; nome: string } } | null;
  status: "ATIVO" | "INATIVO";
}) {
  const { mostrarToast } = useToast();
  const router = useRouter();
  const [pendingStatus, startStatusTransition] = useTransition();
  const [pendingApagar, startApagarTransition] = useTransition();

  function alternarStatus() {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("statusAtual", status);

    startStatusTransition(() => {
      void (async () => {
        try {
          await alternarStatusCandidatoAction(formData);
          router.refresh();
          mostrarToast(
            `${nome} marcado como ${status === "ATIVO" ? "inativo" : "ativo"}.`,
            "sucesso"
          );
        } catch (error) {
          mostrarToast(error instanceof Error ? error.message : "Não foi possível alterar o estado. Tenta novamente.", "erro");
        }
      })();
    });
  }

  function apagar() {
    if (!confirm(`Remover ${nome} da lista de candidatos?`)) return;

    const formData = new FormData();
    formData.set("id", id);

    startApagarTransition(() => {
      void (async () => {
        try {
          await apagarCandidatoAction(formData);
          router.refresh();
          mostrarToast(`${nome} removido da lista.`, "info");
        } catch (error) {
          mostrarToast(error instanceof Error ? error.message : "Não foi possível remover o candidato. Tenta novamente.", "erro");
        }
      })();
    });
  }

  return (
    <tr className="border-b border-navy-900/8 last:border-0">
      <td className="px-5 py-3.5 text-[14.5px] font-medium">
        <Link href={`/admin/candidatos/${id}`} className="focus-ring text-navy-950 hover:text-flame-600 hover:underline">
          {nome}
        </Link>
      </td>
      <td className="px-5 py-3.5 text-[14px] text-navy-950/60">
        {turma ? (
          <>
            {turma.nome}
            <span className="ml-1 text-[12px] text-navy-950/35">· {turma.anoLetivo.nome}</span>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-5 py-3.5 text-[14px] text-navy-950/60">{contacto || "—"}</td>
      <td className="px-5 py-3.5">
        <button
          type="button"
          onClick={alternarStatus}
          disabled={pendingStatus}
          className={`focus-ring rounded-full px-2.5 py-1 text-[12.5px] font-medium transition-colors disabled:opacity-50 ${
            status === "ATIVO"
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-navy-950/5 text-navy-950/50 hover:bg-navy-950/10"
          }`}
        >
          {status === "ATIVO" ? "Ativo" : "Inativo"}
        </button>
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          type="button"
          onClick={apagar}
          disabled={pendingApagar}
          className="focus-ring rounded-md p-2 text-navy-950/35 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Remover candidato"
        >
          {pendingApagar ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </td>
    </tr>
  );
}
