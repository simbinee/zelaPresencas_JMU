import { TurmaParaSelecao } from "@/lib/turmas";

export function TurmaSelect({
  turmas,
  label = "Turma",
  name = "turmaId",
  defaultValue = "",
  required = false,
}: {
  turmas: TurmaParaSelecao[];
  label?: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const grupos = new Map<string, { anoNome: string; turmas: TurmaParaSelecao[] }>();
  for (const t of turmas) {
    if (!grupos.has(t.anoLetivoId)) {
      grupos.set(t.anoLetivoId, { anoNome: t.anoLetivo.nome, turmas: [] });
    }
    grupos.get(t.anoLetivoId)!.turmas.push(t);
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-900/80">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="focus-ring w-full rounded-md border border-navy-900/15 bg-white px-3.5 py-2.5 text-[15px] text-navy-950"
      >
        <option value="">Sem turma</option>
        {turmas.length === 0 && (
          <option value="" disabled>
            Ainda não há turmas — cria uma em "Turmas"
          </option>
        )}
        {Array.from(grupos.values()).map((grupo) => (
          <optgroup key={grupo.anoNome} label={grupo.anoNome}>
            {grupo.turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
