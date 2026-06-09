// Helpers para series con datos REALES (sólido, con fuente) y SUPUESTOS
// (no publicados: interpolación/aproximación, punteado y en otro color).

export interface Pt {
  year: number
  value: number
  real: boolean
  method?: string
  source_url?: string
}

const EST_COLOR = '#f59e0b' // ámbar = supuesto/no publicado

/** Construye dos series ECharts para una métrica: backbone estimado (punteado)
 * + capa real (sólida, marcadores grandes). Tooltip distingue real vs supuesto. */
export function twoTone(pts: Pt[], color: string, name = '') {
  const xs = pts.map((p) => String(p.year))
  const estimado = pts.map((p) => p.value)
  const real = pts.map((p) => (p.real ? p.value : null))
  const flags = pts.map((p) => p.real)
  const series = [
    {
      name: name ? `${name} · estimado` : 'Estimado (no publicado)',
      type: 'line',
      data: estimado,
      smooth: false,
      connectNulls: true,
      lineStyle: { type: 'dashed', color: EST_COLOR, width: 1.5 },
      itemStyle: { color: EST_COLOR },
      symbol: 'emptyCircle',
      symbolSize: 5,
      z: 1,
    },
    {
      name: name ? `${name} · real` : 'Real (con fuente)',
      type: 'line',
      data: real,
      connectNulls: false,
      lineStyle: { color, width: 3 },
      itemStyle: { color },
      symbol: 'circle',
      symbolSize: 9,
      z: 2,
    },
  ]
  return { xs, series, flags }
}

/** Opción ECharts completa para una métrica de una empresa (dos tonos). */
export function metricOption(pts: Pt[], color: string, unit = 'S/ MM') {
  const { xs, series, flags } = twoTone(pts, color)
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: { axisValue: string; dataIndex: number }[]) => {
        const i = params[0]?.dataIndex ?? 0
        const real = flags[i]
        const v = pts[i]?.value
        const tag = real
          ? '<span style="color:#16a34a">● dato real (con fuente)</span>'
          : '<span style="color:#f59e0b">○ supuesto (no publicado · aprox.)</span>'
        return `<b>${pts[i]?.year}</b><br/>${v?.toLocaleString('es-PE')} ${unit}<br/>${tag}`
      },
    },
    legend: { show: false },
    grid: { left: 56, right: 14, top: 16, bottom: 26 },
    xAxis: { type: 'category', data: xs },
    yAxis: { type: 'value', name: unit },
    series,
  }
}

/** Cuenta cuántos puntos reales vs supuestos hay (para badges/leyenda). */
export function counts(pts: Pt[]) {
  const real = pts.filter((p) => p.real).length
  return { real, est: pts.length - real }
}
