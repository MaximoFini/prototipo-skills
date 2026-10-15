// Texto a voz con la Web Speech API (voz en inglés del dispositivo).
export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
export function speak(text: string, opts: { slow?: boolean } = {}) {
  if (!ttsAvailable()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = opts.slow ? 0.55 : 0.95
  const voice = synth.getVoices().find((v) => v.lang.startsWith('en'))
  if (voice) u.voice = voice
  synth.speak(u)
}
