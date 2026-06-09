import { Link } from 'react-router-dom'
import { Shield, Building2, Landmark, HeartPulse, Users, ArrowRight, Wallet, PiggyBank } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { solesCompact } from '@/lib/format'

export function Resumen() {
  const { data, loading, error } = useData()
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const d = data as any

  const pres = d.presupuesto
  const defSerie = pres.sectores.find((s: any) => s.sector === 'Defensa')?.serie || []
  const intSerie = pres.sectores.find((s: any) => s.sector === 'Interior')?.serie || []
  const years = defSerie.map((p: any) => String(p.year))
  const def2026 = defSerie.find((p: any) => p.year === 2026)?.value
  const int2026 = intSerie.find((p: any) => p.year === 2026)?.value
  const cpmp = d.pensiones?.cpmp

  const presOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    legend: { data: ['Defensa', 'Interior'], top: 0 },
    grid: { left: 64, right: 16, top: 32, bottom: 26 },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [
      { name: 'Defensa', type: 'bar', itemStyle: { color: '#2563eb' }, data: defSerie.map((p: any) => p.value) },
      { name: 'Interior', type: 'bar', itemStyle: { color: '#9333ea' }, data: intSerie.map((p: any) => p.value) },
    ],
  }

  const modules = [
    { to: '/empresas', icon: Building2, title: 'Empresas de Defensa', desc: 'SIMA, FAME y SEMAN — EE.FF. reales, ingresos, utilidad y ROE.', tag: '3 empresas FONAFE' },
    { to: '/presupuesto', icon: Landmark, title: 'Presupuesto y proyectos', desc: 'Sector → pliego → genérica → proyecto de inversión.', tag: `${pres.pliegos.length} pliegos · ${pres.proyectos.length} proyectos` },
    { to: '/pensiones', icon: HeartPulse, title: 'Pensiones, salud y bienestar', desc: 'CPMP, SALUDPOL, IAFAS y el subsidio del Tesoro.', tag: `${cpmp?.pensionistas?.toLocaleString('es-PE')} pensionistas` },
    { to: '/remuneraciones', icon: Users, title: 'Remuneraciones', desc: 'Escala por grado, gasto en personal y efectivos.', tag: 'escala única FFAA/PNP' },
  ]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Sector Defensa e Interior — panorama del gasto"
        subtitle="Inteligencia financiera del aparato de seguridad del Estado: empresas, presupuesto, previsional y remuneraciones. Datos reales con fuente; lo no publicado, marcado como supuesto."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Landmark} label="Presupuesto Defensa 2026" value={def2026 ? solesCompact(def2026) : '—'} hint="PIA · sustentación Congreso" />
        <Stat icon={Landmark} label="Presupuesto Interior 2026" value={int2026 ? solesCompact(int2026) : '—'} hint="PIA · sustentación Congreso" />
        <Stat icon={Wallet} label="Planilla pensiones CPMP" value={cpmp ? solesCompact(cpmp.planilla) : '—'} hint={`subsidio Tesoro ${cpmp ? solesCompact(cpmp.subsidioTesoro) : ''}`} />
        <Stat icon={PiggyBank} label="Aportes vs. egresos CPMP" value={cpmp ? `${Math.round((cpmp.aportesIngreso / cpmp.planilla) * 100)}%` : '—'} hint="los aportes solo cubren esa fracción" />
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">La asimetría que define al sector</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 font-semibold">Defensa — dimensión empresarial</div>
            <p className="text-muted-foreground">Brazo industrial bajo FONAFE: SIMA, FAME, SEMAN. Ejército, Marina y FAP son <strong>unidades ejecutoras</strong> del Pliego 026 MINDEF.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 font-semibold">Interior — dimensión presupuestal</div>
            <p className="text-muted-foreground"><strong>Sin empresas estatales.</strong> La PNP es UE del Pliego 007 MININTER. Materialidad en presupuesto, compras y planilla.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Presupuesto de apertura por sector (PIA)</CardTitle></CardHeader>
        <CardContent>
          <Chart option={presOption} height={280} />
          <p className="mt-2 text-xs text-muted-foreground">Interior supera a Defensa en presupuesto total; Defensa concentra la actividad empresarial e industrial. Fuente: sustentación al Congreso del Presupuesto 2026.</p>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Módulos del tablero</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <Link key={m.to} to={m.to}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardContent className="flex items-start gap-3 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><m.icon className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold">{m.title} <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
                    <Badge variant="outline" className="mt-2">{m.tag}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Shield; label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-lg font-bold leading-tight">{value}</div>
          <div className="truncate text-[11px] text-muted-foreground">{label}</div>
          <div className="truncate text-[10px] text-muted-foreground/70">{hint}</div>
        </div>
      </CardContent>
    </Card>
  )
}
