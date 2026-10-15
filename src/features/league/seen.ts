// Marca si el alumno ya vio la pantalla de fin de semana de liga. localStorage con respaldo en memoria.
const COUNT_KEY = 'skills-go-league-closes'
const seenKey = (weekStart: string) => `skills-go-league-seen-${weekStart}`
let memCount = 0
let memSeen = ''

function readCount(): number {
  try {
    const v = localStorage.getItem(COUNT_KEY)
    if (v !== null) return Number(v) || 0
  } catch { /* sin storage */ }
  return memCount
}
/** Se llama cada vez que se cierra una semana: la nueva pantalla de resultado queda "sin ver". */
export function bumpLeagueClose(): void {
  memCount = readCount() + 1
  try { localStorage.setItem(COUNT_KEY, String(memCount)) } catch { /* sin storage */ }
}
export function isResultSeen(weekStart: string): boolean {
  const c = String(readCount())
  try {
    const v = localStorage.getItem(seenKey(weekStart))
    if (v !== null) return v === c
  } catch { /* sin storage */ }
  return memSeen === `${weekStart}:${c}`
}
export function markResultSeen(weekStart: string): void {
  const c = String(readCount())
  memSeen = `${weekStart}:${c}`
  try { localStorage.setItem(seenKey(weekStart), c) } catch { /* sin storage */ }
}
