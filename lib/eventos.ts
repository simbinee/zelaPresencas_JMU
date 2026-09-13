/**
 * Um evento só é considerado "já passado" depois do fim do dia em que
 * está marcado (23:59:59.999 local), não assim que a hora exata passa.
 * Isto evita bloquear a marcação de presenças de um evento que ainda
 * está a decorrer (ex: marcado para as 09:00 mas que dura o dia todo).
 */
export function eventoJaTerminou(dataEvento: Date, agora: Date = new Date()): boolean {
  const fimDoDia = new Date(dataEvento);
  fimDoDia.setHours(23, 59, 59, 999);
  return fimDoDia.getTime() < agora.getTime();
}
