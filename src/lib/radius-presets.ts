export const RADIUS_KM_PRESETS = [5, 10, 25, 50, 100] as const

export type RadiusPreset = (typeof RADIUS_KM_PRESETS)[number]

export function snapRadiusToPreset(km: number): RadiusPreset {
  const n = Math.round(km)
  let best: RadiusPreset = RADIUS_KM_PRESETS[0]
  let bestD = Math.abs(best - n)
  for (const v of RADIUS_KM_PRESETS) {
    const d = Math.abs(v - n)
    if (d < bestD) {
      best = v
      bestD = d
    }
  }
  return best
}
