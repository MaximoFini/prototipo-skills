// Sonidos sintetizados con WebAudio (sin archivos, funcionan offline).
import { useApp } from '@/store/useApp'

let ctx: AudioContext | null = null
function ac(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  const c = ac(); if (!c) return
  const o = c.createOscillator(); const g = c.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + start)
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.02)
}
const enabled = () => useApp.getState().settings.sound
export const sfx = {
  correct: () => enabled() && (tone(659, 0, 0.12, 'triangle'), tone(880, 0.1, 0.2, 'triangle')),
  wrong: () => enabled() && (tone(220, 0, 0.18, 'sawtooth', 0.1), tone(165, 0.14, 0.25, 'sawtooth', 0.1)),
  tap: () => enabled() && tone(520, 0, 0.05, 'square', 0.05),
  finish: () => enabled() && [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle')),
  streak: () => enabled() && [392, 523, 659, 784, 988].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle')),
  heartLost: () => enabled() && (tone(300, 0, 0.1, 'square', 0.08), tone(180, 0.1, 0.3, 'square', 0.08)),
  gem: () => enabled() && (tone(988, 0, 0.08, 'sine'), tone(1319, 0.07, 0.15, 'sine')),
  notify: () => enabled() && (tone(880, 0, 0.1, 'sine'), tone(1175, 0.12, 0.18, 'sine')),
}
