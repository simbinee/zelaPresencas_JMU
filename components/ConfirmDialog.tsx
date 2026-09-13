"use client";

import { Botao } from "./Botao";

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  confirmLabel = "Confirmar",
  cancelarLabel = "Cancelar",
  perigo = false,
  onConfirm,
  onCancel,
}: {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  confirmLabel?: string;
  cancelarLabel?: string;
  perigo?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 px-4 pb-6 sm:items-center sm:pb-0"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-navy-900/10 bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-[17px] font-semibold text-navy-950">{titulo}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-navy-950/60">{mensagem}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Botao variant="secondary" onClick={onCancel}>
            {cancelarLabel}
          </Botao>
          <Botao variant={perigo ? "perigo" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Botao>
        </div>
      </div>
    </div>
  );
}
