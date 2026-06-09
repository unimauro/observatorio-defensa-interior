import { useState } from 'react'
import { Landmark, ExternalLink, AlertTriangle, Building } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'

export function Presupuesto() {
  const { data, loading, error } = useData()
  const [sector, setSector] = useState<'Defensa' | 'Interior'>('Defensa')
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const p = (data as any).presupuesto

  // Pliegos del sector (último año disponible)
  const pliegos = p.pliegos.filter((x: any) => x.sector === sector)
  const pliegoYears = Array.from(new Set(pliegos.flatMap((x: any) => Object.keys(x.pia).map(Number)))).sort() as number[]
  const lastY = pliegoYears[pliegoYears.length - 1]
  const pliegosOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: { type: 'value', name: 'S/ MM' },
    yAxis: { type: 'category', data: pliegos.map((x: any) => x.pliego).reverse(), axisLabel: { fontSize: 10, width: 180, overflow: 'truncate' } },
    series: [{ type: 'bar', data: pliegos.map((x: any) => x.pia[lastY] ?? null).reverse(), itemStyle: { color: sector === 'Defensa' ? '#2563eb' : '#9333ea' }, label: { show: true, position: 'right', fontSize: 10, formatter: (a: any) => (a.value ? a.value.toLocaleString('es-PE') : '') } }],
  }

  // Composición por genérica (stacked)
  const g = p.genericas[sector]
  const genOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    legend: { top: 0, type: 'scroll' },
    grid: { left: 64, right: 16, top: 30, bottom: 26 },
    xAxis: { type: 'category', data: g.years.map(String) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [
      { name: 'Personal', type: 'bar', stack: 't', data: g.personal, itemStyle: { color: '#2563eb' } },
      { name: 'Pensiones', type: 'bar', stack: 't', data: g.pensiones, itemStyle: { color: '#7c3aed' } },
      { name: 'Bienes y servicios', type: 'bar', stack: 't', data: g.bienes, itemStyle: { color: '#0891b2' } },
      { name: 'Inversión', type: 'bar', stack: 't', data: g.inversion, itemStyle: { color: '#16a34a' } },
      { name: 'Deuda', type: 'bar', stack: 't', data: g.deuda, itemStyle: { color: '#94a3b8' } },
    ],
  }

  // Inversión por fuerza 2026
  const invOption = {
    tooltip: { trigger: 'item', valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    series: [{ type: 'pie', radius: ['40%', '70%'], data: p.inversionPorFuerza2026.map((x: any) => ({ name: x.fuerza, value: x.monto })), label: { formatter: '{b}: S/{c} MM', fontSize: 10 } }],
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Presupuesto y proyectos de inversión" subtitle="Del sector al proyecto: pliegos, composición del gasto y obras de inversión. Cifras PIA verificadas (sustentación al Congreso 2026)." />

      <div className="flex gap-2">
        {(['Defensa', 'Interior'] as const).map((s) => (
          <button key={s} onClick={() => setSector(s)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${sector === s ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>{s}</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Presupuesto por pliego · {sector} ({lastY})</CardTitle></CardHeader>
          <CardContent><Chart option={pliegosOption} height={280} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Composición del gasto · {sector}</CardTitle></CardHeader>
          <CardContent>
            <Chart option={genOption} height={280} />
            <p className="mt-2 text-[11px] text-muted-foreground">El <strong>personal</strong> es el gran rubro (~53% en Defensa) — el costo más rígido a controlar.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inversión por fuerza · Defensa 2026</CardTitle></CardHeader>
          <CardContent><Chart option={invOption} height={260} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ejecución de inversiones</CardTitle>
            <Badge variant="success">real</Badge>
          </CardHeader>
          <CardContent className="space-y-2 pt-1 text-sm">
            {p.ejecucion.map((e: any, i: number) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{e.ambito} · {e.year}</span><span className="text-lg font-bold text-emerald-500">{e.pct}%</span></div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-emerald-500" style={{ width: `${e.pct}%` }} /></div>
                <div className="mt-1 text-[11px] text-muted-foreground">PIM S/ {e.pim.toLocaleString('es-PE')} MM · devengado S/ {e.devengado.toLocaleString('es-PE')} MM</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Proyectos */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2"><Building className="h-4 w-4 text-primary" /><CardTitle className="text-sm">Proyectos de inversión 2026 (asignación del año)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-2">Proyecto</th><th className="px-4 py-2">Fuerza</th><th className="px-4 py-2 text-right">Monto 2026</th><th className="px-4 py-2">CUI</th><th className="px-4 py-2">Estado</th></tr></thead>
              <tbody>
                {p.proyectos.map((pr: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-2">{pr.nombre}</td>
                    <td className="px-4 py-2"><Badge variant="outline">{pr.fuerza}</Badge></td>
                    <td className="px-4 py-2 text-right font-semibold">S/ {pr.monto2026.toLocaleString('es-PE')} MM</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{pr.cui}</td>
                    <td className="px-4 py-2 text-xs">{pr.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="space-y-1.5 pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground"><AlertTriangle className="h-4 w-4 text-amber-500" /> Notas</div>
          {p.notas.map((n: string, i: number) => <p key={i}>• {n}</p>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fuentes</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          {p.sources.map((s: any) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><ExternalLink className="h-3 w-3 shrink-0" /> {s.name}</a>)}
        </CardContent>
      </Card>
    </div>
  )
}
