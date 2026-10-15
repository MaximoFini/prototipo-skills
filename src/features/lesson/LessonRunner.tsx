import type { Exercise, RunnerResult } from '@/domain/types'

/**
 * CONTRATO (lo implementa el subagente A). Motor de ejercicios reutilizable por
 * Lección, Test de nivel (B) y Práctica (C).
 */
export interface LessonRunnerProps {
  exercises: Exercise[]
  mode: 'lesson' | 'practice' | 'placement'
  /** Si false, los errores no restan corazones (práctica con corazones llenos, test de nivel). */
  consumesHearts: boolean
  /** Si false no muestra el panel verde/rojo de feedback (test de nivel). */
  showFeedback?: boolean
  onExit: () => void
  onComplete: (result: RunnerResult) => void
  /** Se llama cuando el alumno llega a 0 corazones durante la lección. */
  onOutOfHearts: (result: RunnerResult) => void
}
export function LessonRunner(_props: LessonRunnerProps) {
  return <div className="grid h-full place-items-center text-go-muted">LessonRunner pendiente</div>
}
