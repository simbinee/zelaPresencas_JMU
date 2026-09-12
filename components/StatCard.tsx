export function StatCard({
  label,
  valor,
  detalhe,
  destaque = false,
}: {
  label: string;
  valor: string | number;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        destaque
          ? "border-navy-900 bg-navy-950 text-white"
          : "border-navy-900/10 bg-white text-navy-950"
      }`}
    >
      <p className={`text-[13px] font-medium ${destaque ? "text-parchment-100/60" : "text-navy-950/50"}`}>
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold">{valor}</p>
      {detalhe && (
        <p className={`mt-1 text-[12.5px] ${destaque ? "text-parchment-100/50" : "text-navy-950/40"}`}>
          {detalhe}
        </p>
      )}
    </div>
  );
}
