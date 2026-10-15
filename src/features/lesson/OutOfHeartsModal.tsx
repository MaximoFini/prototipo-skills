/**
 * CONTRATO (lo implementa el subagente A). Modal "¡Te quedaste sin vidas!".
 * - `onPractice`: navegar a /practice/session?heal=1
 * - `onClose`: volver al inicio.
 * Usable desde cualquier pantalla (ej. PathPage al tocar un nodo con 0 corazones).
 */
export interface OutOfHeartsModalProps {
  open: boolean
  onClose: () => void
  onPractice: () => void
}
export function OutOfHeartsModal(_props: OutOfHeartsModalProps) {
  return null
}
