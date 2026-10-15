import { createRoot } from 'react-dom/client'
import { StreakExtendedScreen } from './StreakExtendedScreen'
import { DailyGoalCelebration } from './DailyGoalCelebration'
export function mount(kind: string, n = 7) {
  const el = document.createElement('div')
  document.getElementById('phone-root')!.appendChild(el)
  createRoot(el).render(kind === 'streak' ? <StreakExtendedScreen streak={n} onContinue={() => el.remove()} /> : <DailyGoalCelebration goal={n} onContinue={() => el.remove()} />)
}
