/** CONTRATO (subagente C). Pantalla de "¡Meta diaria cumplida!" con aro completo y mascota festejando. */
export function DailyGoalCelebration({ goal, onContinue }: { goal: number; onContinue: () => void }) {
  return <button onClick={onContinue}>Meta de {goal} XP cumplida — continuar</button>
}
