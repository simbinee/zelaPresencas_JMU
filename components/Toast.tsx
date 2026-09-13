"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastTipo = "sucesso" | "erro" | "info";

type ToastItem = {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
};

type ToastContextValue = {
  mostrarToast: (mensagem: string, tipo?: ToastTipo) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastTipo, typeof CheckCircle2> = {
  sucesso: CheckCircle2,
  erro: XCircle,
  info: Info,
};

const ESTILOS: Record<ToastTipo, string> = {
  sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800 [&_svg]:text-emerald-600",
  erro: "border-red-200 bg-red-50 text-red-800 [&_svg]:text-red-600",
  info: "border-navy-900/15 bg-white text-navy-950 [&_svg]:text-navy-950/60",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const proximoId = useRef(0);

  const removerToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (mensagem: string, tipo: ToastTipo = "sucesso") => {
      const id = proximoId.current++;
      setToasts((prev) => [...prev, { id, tipo, mensagem }]);
      setTimeout(() => removerToast(id), 4000);
    },
    [removerToast]
  );

  const value = useMemo(() => ({ mostrarToast }), [mostrarToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((t) => {
          const Icone = ICONS[t.tipo];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg animate-toast-in ${ESTILOS[t.tipo]}`}
            >
              <Icone size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-[13.5px] font-medium leading-snug">{t.mensagem}</p>
              <button
                onClick={() => removerToast(t.id)}
                aria-label="Fechar notificação"
                className="focus-ring shrink-0 rounded p-0.5 opacity-50 hover:opacity-100"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast tem de ser usado dentro de um ToastProvider.");
  }
  return ctx;
}
