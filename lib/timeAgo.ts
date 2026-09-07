// Tiempo relativo simple en español ("hace 2h") — sin librería de fechas,
// usado en la Home de marca (preguntas/opiniones) y en app/brand/questions.tsx.
export function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `hace ${diffD}d`
  const diffW = Math.floor(diffD / 7)
  if (diffW < 5) return `hace ${diffW} sem`
  const diffM = Math.floor(diffD / 30)
  return `hace ${diffM} ${diffM === 1 ? 'mes' : 'meses'}`
}
