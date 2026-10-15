/**
 * CONTRATO (lo implementa el subagente C). Pantalla "racha extendida":
 * llama animada, número de racha, calendario semanal (L-D) con los días practicados, botón CONTINUAR.
 */
export interface StreakExtendedScreenProps {
  streak: number
  onContinue: () => void
}
export function StreakExtendedScreen({ onContinue, streak }: StreakExtendedScreenProps) {
  return <button onClick={onContinue}>Racha {streak} — continuar</button>
}
