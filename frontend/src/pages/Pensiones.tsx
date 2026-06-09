import { HeartPulse, ExternalLink, AlertTriangle, Users, ShieldAlert } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { solesCompact } from '@/lib/format'

export function Pensiones() {
  const { data, loading, error } = useData()
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const pen = (data as any).pensiones
  const c = pen.cpmp

  // Aportes vs egresos vs subsidio
  const flujoOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    grid: { left: 70, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: c.flujo.map((f: any) => f.label), axisLabel: { fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [{
      type: 'bar',
      data: c.flujo.map((f: any, i: number) => ({ value: f.value, itemStyle: { color: ['#16a34a', '#dc2626', '#f59e0b'][i] } })),
      label: { show: true, position: 'top', formatter: (a: any) => `S/ ${a.value.toLocaleString('es-PE')} MM` },
    }],
  }
  const coberturaAportes = Math.round((c.aportesIngreso / c.planilla) * 100)

  return (
    <div className="space-y-6">
      <PageTitle title="Pensiones, salud y bienestar militar-policial" subtitle="El ecosistema previsional y de salud de las FF.AA. y la PNP: fondos con plata propia y obligaciones de largo plazo." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Pensionistas CPMP" value={c.pensionistas.toLocaleString('es-PE')} hint={`${c.pnpShare}% PNP · ${c.year}`} />
        <Stat icon={HeartPulse} label="Planilla de pensiones" value={solesCompact(c.planilla)} hint={`aportes solo ${solesCompact(c.aportesIngreso)}`} />
        <Stat icon={ShieldAlert} label="Subsidio del Tesoro" value={solesCompact(c.subsidioTesoro)} hint="DS 305-2023-EF" />
        <Stat icon={Users} label="Afiliados SALUDPOL" value={pen.saludpol.afiliados.toLocaleString('es-PE')} hint={`${pen.saludpol.year}`} />
      </div>

      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Aportes vs. egresos vs. subsidio — Caja de Pensiones Militar Policial ({c.year})</CardTitle>
          <Badge variant="success">real</Badge>
        </CardHeader>
        <CardContent>
          <Chart option={flujoOption} height={280} />
          <p className="mt-2 text-sm text-muted-foreground">
            Los aportes de los activos (S/ {c.aportesIngreso.toLocaleString('es-PE')} MM) cubren solo el <strong>{coberturaAportes}%</strong> de la planilla de pensiones (S/ {c.planilla.toLocaleString('es-PE')} MM). El régimen D.L. 19846 está <strong>cerrado desde 2012</strong>: el Tesoro Público cubre la brecha (S/ {c.subsidioTesoro.toLocaleString('es-PE')} MM). <strong>Es el mayor pasivo del sector.</strong>
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 pt-6 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <div className="font-semibold text-foreground">Reforma {c.reforma.ley} — alerta fiscal</div>
            <p className="text-muted-foreground">El Consejo Fiscal estima el costo en <strong>{solesCompact(c.reforma.costoConsejoFiscal)}</strong> (valor presente), <strong>~3×</strong> el estimado del MEF ({solesCompact(c.reforma.costoMEF)}). La tasa de aporte actual ({c.reforma.tasaActual}%) está muy por debajo de la sostenible ({c.reforma.tasaSostenible}%). <span className="italic">Estimación del Consejo Fiscal vía prensa.</span></p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* IAFAS de salud */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fondos de salud (IAFAS) por fuerza</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div><div className="font-medium">SALUDPOL (PNP)</div><div className="text-[11px] text-muted-foreground">D.L. 1174</div></div>
              <div className="text-right"><div className="font-semibold">{pen.saludpol.afiliados.toLocaleString('es-PE')}</div><div className="text-[11px] text-muted-foreground">afiliados {pen.saludpol.year}</div></div>
            </div>
            {pen.iafas.map((f: any) => (
              <div key={f.fondo} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div className="font-medium">{f.fondo}</div>
                <div className="text-right"><div className="font-semibold">{f.afiliados.toLocaleString('es-PE')}</div><div className="text-[11px] text-amber-600">afiliados {f.year} · dato desactualizado</div></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bonos */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Bonificaciones por riesgo (D.L. 1132)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {pen.bonos.map((b: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 py-1.5">
                <span className="text-xs">{b.concepto}</span>
                <span className="font-semibold">S/ {b.monto.toLocaleString('es-PE')}</span>
              </div>
            ))}
            <p className="pt-1 text-[11px] text-muted-foreground">Más subsidios por invalidez en acto de servicio (D.L. 19846, Ley 30683) y pensión de sobrevivientes.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="space-y-1 pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground"><AlertTriangle className="h-4 w-4 text-amber-500" /> Notas</div>
          {pen.notas.map((n: string, i: number) => <p key={i}>• {n}</p>)}
          <p>• Presupuesto de SALUDPOL y las IAFAS-FFAA y afiliados actuales de FOSPEME/FOSMAR/FOSFAP requieren acceso a Consulta Amigable / SUSALUD (no público en web abierta).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fuentes</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          <a href={c.source} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Memoria Anual 2023 — Caja de Pensiones Militar Policial</a>
          <a href={pen.saludpol.source} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> SALUDPOL — afiliados (El Peruano)</a>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof HeartPulse; label: string; value: string; hint: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 pt-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div className="min-w-0"><div className="text-lg font-bold leading-tight">{value}</div><div className="truncate text-[11px] text-muted-foreground">{label}</div><div className="truncate text-[10px] text-muted-foreground/70">{hint}</div></div>
    </CardContent></Card>
  )
}
