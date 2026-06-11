// Tiny WebAudio synth — sound is optional garnish: short, soft, charming,
// globally mutable, never required to understand state.

const MUTE_KEY = 'sqz_muted'

export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setMuted(muted: boolean) {
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
}

let ctx: AudioContext | null = null
function audio(): AudioContext | null {
  if (isMuted()) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, at: number, dur: number, gainPeak = 0.12, type: OscillatorType = 'sine') {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, ac.currentTime + at)
  gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + at + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(ac.currentTime + at)
  osc.stop(ac.currentTime + at + dur + 0.05)
}

/** check-off star-flight: a bright little chirp */
export function playCheck() {
  tone(740, 0, 0.16, 0.1)
  tone(1180, 0.06, 0.22, 0.08)
}

/** daily win: a rising arpeggio */
export function playDailyWin() {
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, 0.1))
}

/** streak milestone / bonus stars raining */
export function playBonus() {
  ;[880, 1109, 1319].forEach((f, i) => tone(f, i * 0.07, 0.25, 0.09, 'triangle'))
}

/** ceremony beat: slower, warmer */
export function playCeremony() {
  ;[392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.16, 0.5, 0.08))
}

/** soft negative-space tap (locked card) */
export function playLocked() {
  tone(196, 0, 0.12, 0.05, 'triangle')
}
