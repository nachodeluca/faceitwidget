export const OBS_OUTPUT_SCALE = 1.5

export function getWidgetZoom(configScale: number, outputScale = 1) {
  return configScale * outputScale
}
