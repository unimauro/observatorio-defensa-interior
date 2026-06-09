import { Users, ExternalLink, AlertTriangle, Lock } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { solesCompact } from '@/lib/format'

export function Remuneraciones() {
  const { data, loading, error } = useData()
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const r = (data as any).remuneraciones

  const escala = [...r.escala].sort((a: any, b: any) => a.monto - b.monto)
  const escalaOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')}` },
    grid: { left: 8, right: 70, top: 10, bottom: 8, containLabel: true },
    xAxis: { type: 'value', name: 'S/ /mes' },
    yAxis: { type: 'category', data: escala.map((e: any) => e.grado), axisLabel: { fontSize: 9, width: 190, overflow: 'truncate' } },
    series: [{
      type: 'bar',
      data: escala.map((e: any) => ({ value: e.monto, itemStyle: { color: e.tipo === 'Oficiales' ? '#2563eb' : '#0891b2' } })),
      label: { show: true, position: 'right', fontSize: 10, formatter: (a: any) => `S/ ${a.value.toLocaleString('es-PE')}` },
    }],
  }

  const efOption = {
    tooltip: { trigger: 'item' },
    grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: r.servicioMilitar.map((s: any) => s.fuerza) },
    series: [{ type: 'bar', data: r.servicioMilitar.map((s: any) => s.n), itemStyle: { color: '#16a34a' }, label: { show: true, position: 'right', fontSize: 10, formatter: (a: any) => a.value.toLocaleString('es-PE') } }],
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Remuneraciones del personal" subtitle="Escala por grado (escala única FF.AA./PNP), gasto en personal por pliego y dotación. El personal es el mayor rubro del presupuesto." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {r.personalPorPliego.map((x: any) => (
          <Stat key={x.pliego} icon={Users} label={`Personal · ${x.pliego}`} value={solesCompact(x.total)} hint={`PIA ${x.year}`} />
        ))}
        {r.efectivos.filter((e: any) => e.confianza === 'alta').map((e: any) => (
          <Stat key={e.fuerza} icon={Users} label={`Efectivos ${e.fuerza}`} value={e.n.toLocaleString('es-PE')} hint={`${e.year}`} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Escala remunerativa por grado — Remuneración Consolidada</CardTitle>
          <Badge variant="success">real · DS 292-2025-EF</Badge>
        </CardHeader>
        <CardContent>
          <Chart option={escalaOption} height={420} />
          <p className="mt-2 text-sm text-muted-foreground"><strong>Hallazgo:</strong> la escala es <strong>única</strong> para Ejército, Marina, FAP y PNP (D.L. 1132): a igual grado equivalente, el haber base consolidado es idéntico entre fuerzas. La diferencia real entre personas viene de bonificaciones no consolidadas y antigüedad.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Servicio Militar Acuartelado por fuerza (2026)</CardTitle></CardHeader>
          <CardContent>
            <Chart option={efOption} height={180} />
            <p className="mt-2 text-[11px] text-muted-foreground">Asignación económica ~S/ 256/mes → S/ 384 desde jun-2026 (Ley 32590).</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Personal CAS y consultores</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-lg border border-border p-3">
              <div className="font-medium">{r.cas.regimen}</div>
              <div className="mt-1 text-2xl font-bold">{r.cas.rango}</div>
              <div className="text-[11px] text-muted-foreground">rango remunerativo (de convocatorias públicas)</div>
            </div>
            <p className="text-[11px] text-muted-foreground">El consolidado nominal de CAS/funcionarios/locadores por entidad requiere navegar el Portal de Transparencia Estándar (no expuesto como dataset).</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="space-y-1.5 pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground"><Lock className="h-4 w-4 text-amber-500" /> Límites de transparencia</div>
          {r.notas.map((n: string, i: number) => <p key={i}>• {n}</p>)}
          <p>• El costo unitario por efectivo solo es calculable públicamente para la PNP (planilla ÷ 135,318); para las FF.AA. los efectivos por fuerza están clasificados.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fuentes</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          <a href={r.source} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> DS 292-2025-EF — escala de Remuneración Consolidada (El Peruano)</a>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 pt-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div className="min-w-0"><div className="text-base font-bold leading-tight">{value}</div><div className="truncate text-[11px] text-muted-foreground">{label}</div><div className="truncate text-[10px] text-muted-foreground/70">{hint}</div></div>
    </CardContent></Card>
  )
}
