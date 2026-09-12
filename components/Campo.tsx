import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export const Campo = forwardRef<HTMLInputElement, InputProps>(function Campo(
  { label, className = "", id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-900/80">{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={`focus-ring w-full rounded-md border border-navy-900/15 bg-white px-3.5 py-2.5 text-[15px] text-navy-950 placeholder:text-navy-950/35 ${className}`}
        {...props}
      />
    </label>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export function CampoTexto({ label, className = "", id, ...props }: TextareaProps) {
  const inputId = id || props.name;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-900/80">{label}</span>
      <textarea
        id={inputId}
        className={`focus-ring w-full rounded-md border border-navy-900/15 bg-white px-3.5 py-2.5 text-[15px] text-navy-950 placeholder:text-navy-950/35 ${className}`}
        {...props}
      />
    </label>
  );
}
