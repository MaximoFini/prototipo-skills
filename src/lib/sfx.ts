// Sonidos sintetizados con WebAudio (sin archivos, funcionan offline).
// Voces tipo marimba/campana con armónicos, un poco de reverb y un compresor
// en la salida para que suenen redondos y parejos en el parlante del celular.
import { useApp } from '@/store/useApp'
import { haptic } from './haptics'

let ctx: AudioContext | null = null
let bus: AudioNode | null = null

function ac(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}

/** Reverb corta generada (ruido con caída exponencial): da "aire" sin archivos. */
function impulse(c: AudioContext, seconds = 0.9, decay = 3.2): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

/** Salida común: voces → (seco + reverb) → compresor → parlante. */
function out(c: AudioContext): AudioNode {
  if (bus) return bus
  const input = c.createGain()
  const comp = c.createDynamicsCompressor()
  comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4
  comp.attack.value = 0.003; comp.release.value = 0.2
  const master = c.createGain(); master.gain.value = 0.9
  const verb = c.createConvolver(); verb.buffer = impulse(c)
  const wet = c.createGain(); wet.gain.value = 0.18
  input.connect(comp)
  input.connect(verb).connect(wet).connect(comp)
  comp.connect(master).connect(c.destination)
  bus = input
  return bus
}

type Voice = 'marimba' | 'bell' | 'pluck' | 'thud'
/** [múltiplo de frecuencia, volumen relativo, caída relativa] por voz. */
const PARTIALS: Record<Voice, [number, number, number][]> = {
  marimba: [[1, 1, 1], [4, 0.25, 0.25], [10, 0.06, 0.1]],
  bell: [[1, 1, 1], [2.76, 0.35, 0.6], [5.4, 0.18, 0.35], [8.9, 0.08, 0.2]],
  pluck: [[1, 1, 1], [2, 0.4, 0.5], [3, 0.15, 0.3]],
  thud: [[1, 1, 1], [1.5, 0.3, 0.6]],
}

function note(freq: number, start: number, dur: number, voice: Voice = 'marimba', vol = 0.22, glideTo?: number) {
  const c = ac(); if (!c) return
  const dest = out(c)
  const t0 = c.currentTime + start
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = voice === 'thud' ? 900 : 7000
  lp.connect(dest)
  for (const [mult, amp, decay] of PARTIALS[voice]) {
    const o = c.createOscillator(); const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq * mult, t0)
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo * mult, t0 + dur * 0.8)
    const end = t0 + Math.max(0.04, dur * decay)
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(vol * amp, t0 + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, end)
    o.connect(g).connect(lp)
    o.start(t0); o.stop(end + 0.05)
  }
}

/** Click corto de ruido filtrado (para taps): suena a botón físico, no a pitido. */
function click(start = 0, vol = 0.12) {
  const c = ac(); if (!c) return
  const t0 = c.currentTime + start
  const len = Math.floor(c.sampleRate * 0.03)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4)
  const src = c.createBufferSource(); src.buffer = buf
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 1.2
  const g = c.createGain(); g.gain.value = vol
  src.connect(bp).connect(g).connect(out(c))
  src.start(t0)
}

const enabled = () => useApp.getState().settings.sound
const play = (fn: () => void) => { if (enabled()) fn() }

// Escala de Do mayor (Hz) para que todo suene en la misma "tonalidad".
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, E6 = 1318.5, G6 = 1568

export const sfx = {
  correct: () => { haptic('success'); play(() => { note(E5, 0, 0.35, 'marimba'); note(C6, 0.08, 0.6, 'bell', 0.2) }) },
  wrong: () => { haptic('error'); play(() => { note(196, 0, 0.35, 'thud', 0.3, 150); note(147, 0.12, 0.45, 'thud', 0.25, 110) }) },
  tap: () => { haptic('tap'); play(() => click()) },
  finish: () => { haptic('celebrate'); play(() => [C5, E5, G5, C6].forEach((f, i) => note(f, i * 0.11, 0.7, i === 3 ? 'bell' : 'marimba', 0.2))) },
  streak: () => { haptic('celebrate'); play(() => [G5, A5, C6, E6, G6].forEach((f, i) => note(f, i * 0.07, 0.5, 'bell', 0.14))) },
  heartLost: () => { haptic('error'); play(() => { note(330, 0, 0.25, 'pluck', 0.18, 247); note(220, 0.14, 0.5, 'thud', 0.22, 165) }) },
  gem: () => { haptic('tap'); play(() => { note(E6, 0, 0.3, 'bell', 0.14); note(G6, 0.06, 0.5, 'bell', 0.12) }) },
  notify: () => play(() => { note(G5, 0, 0.4, 'bell', 0.16); note(D5 * 2, 0.12, 0.6, 'bell', 0.14) }),
}
