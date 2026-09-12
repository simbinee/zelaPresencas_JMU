import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "perigo";
};

const estilos: Record<string, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-800 disabled:bg-navy-900/50",
  secondary:
    "bg-white text-navy-900 border border-navy-900/15 hover:border-navy-900/30 hover:bg-navy-950/[0.02]",
  ghost: "text-navy-900 hover:bg-navy-950/5",
  perigo: "bg-white text-red-700 border border-red-200 hover:bg-red-50",
};

export const Botao = forwardRef<HTMLButtonElement, Props>(function Botao(
  { variant = "primary", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${estilos[variant]} ${className}`}
      {...props}
    />
  );
});
