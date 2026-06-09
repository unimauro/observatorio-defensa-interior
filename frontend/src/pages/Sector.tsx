import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Anchor, Crosshair, Plane, Building2, ExternalLink, AlertTriangle, BadgeCheck, Users, Landmark } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'

/**
 * Página central: panorama financiero del SECTOR DEFENSA e INTERIOR.
 * Combina cifras presupuestales VERIFICADAS con fuente (bloque `sector`) y las
 * series de las 3 empresas (ilustrativas salvo realFacts marcados). La asimetría
 * Defensa (con empresas FONAFE) vs Interior (sin empresas) estructura la lectura.
 */

const META: Record<string, { rama: string; icon: typeof Anchor; color: string }> = {
  SIMA: { rama: 'Marina de Guerra', icon: Anchor, color: '#2563eb' },
  FAME: { rama: 'Ejército del Perú', icon: Crosshair, color: '#dc2626' },
  SEMAN: { rama: 'Fuerza Aérea', icon: Plane, color: '#0891b2' },
}

function VerifiedBadge() {
  return <Badge variant="success"><BadgeCheck className="mr-1 h-3 w-3" />con fuente</Badge>
}
function IllustrativeBadge() {
  return <Badge variant="warning">ilustrativo</Badge>
}

export function Sector() {
  const { data, loading, error } = useData()

  const computed = useMemo(() => {
    if (!data) return null
    const years = data.meta.years
    const companies = data.companies
    const last = years.length - 1
    const sector = (data as { sector?: { defensa?: { presupuesto?: { year: number; pia: number }[] }; interior?: { presupuesto?: { year: number; pia: number }[]; entidades?: { n: string; v: string }[] } } }).sector
    const presYears = Array.from(new Set([
      ...(sector?.defensa?.presupuesto || []).map((p) => p.year),
      ...(sector?.interior?.presupuesto || []).map((p) => p.year),
    ])).sort()
    const piaOf = (arr: { year: number; pia: number }[] | undefined, y: number) => arr?.find((p) => p.year === y)?.pia ?? null
    return { years, companies, last, sector, presYears, piaOf }
  }, [data])

  if (loading) return <Loading />
  if (error || !data || !computed) return <ErrorState error={error || 'sin datos'} />
  const { years, companies, last, sector, presYears, piaOf } = computed

  // --- Gráfico 1: presupuesto sectorial Defensa vs Interior ---
  const presupuestoOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    legend: { data: ['Defensa', 'Interior'], top: 0 },
    grid: { left: 64, right: 16, top: 32, bottom: 28 },
    xAxis: { type: 'category', data: presYears.map(String) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [
      { name: 'Defensa', type: 'bar', itemStyle: { color: '#2563eb' }, data: presYears.map((y) => piaOf(sector?.defensa?.presupuesto, y)) },
      { name: 'Interior', type: 'bar', itemStyle: { color: '#9333ea' }, data: presYears.map((y) => piaOf(sector?.interior?.presupuesto, y)) },
    ],
  }

  // --- Gráfico 2: ingresos por empresa (último año) ---
  const ingresosOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    grid: { left: 56, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: companies.map((c) => c.acronym) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [{
      type: 'bar',
      data: companies.map((c) => ({ value: c.financials[last]?.revenue ?? 0, itemStyle: { color: META[c.acronym]?.color || '#64748b' } })),
      label: { show: true, position: 'top', formatter: (p: { value: number }) => `S/ ${p.value} MM` },
    }],
  }

  // --- Gráfico 3: evolución de ingresos de las 3 empresas ---
  const evoOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: companies.map((c) => c.acronym), top: 0 },
    grid: { left: 56, right: 16, top: 32, bottom: 28 },
    xAxis: { type: 'category', data: years.map(String) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: companies.map((c) => ({
      name: c.acronym, type: 'line', smooth: true,
      itemStyle: { color: META[c.acronym]?.color }, lineStyle: { color: META[c.acronym]?.color },
      data: c.financials.map((f) => f.revenue),
    })),
  }

  // --- Gráfico 4: resultado neto por empresa (último año) ---
  const netoOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `S/ ${(v ?? 0).toLocaleString('es-PE')} MM` },
    grid: { left: 56, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: companies.map((c) => c.acronym) },
    yAxis: { type: 'value', name: 'S/ MM' },
    series: [{
      type: 'bar',
      data: companies.map((c) => {
        const v = c.financials[last]?.netIncome ?? 0
        return { value: v, itemStyle: { color: v < 0 ? '#dc2626' : '#16a34a' } }
      }),
      label: { show: true, position: 'top', formatter: (p: { value: number }) => `${p.value}` },
    }],
  }

  // --- Gráfico 5: empleados por empresa ---
  const empleadosOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 56, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: companies.map((c) => c.acronym) },
    yAxis: { type: 'value', name: 'trabajadores' },
    series: [{
      type: 'bar',
      data: companies.map((c) => ({ value: c.employees || 0, itemStyle: { color: META[c.acronym]?.color || '#64748b' } })),
      label: { show: true, position: 'top' },
    }],
  }

  const totalDefensa2025 = piaOf(sector?.defensa?.presupuesto, 2025)
  const totalInterior2025 = piaOf(sector?.interior?.presupuesto, 2025)

  return (
    <div className="space-y-6">
      <PageTitle
        title="Sector Defensa e Interior"
        subtitle="Panorama financiero del aparato de seguridad del Estado: empresas industriales de Defensa (FONAFE) y presupuesto del sector Interior."
      />

      {/* Cifras macro */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Empresas FONAFE · Defensa" value="3" hint="SIMA · FAME · SEMAN" />
        <StatCard icon={Shield} label="Empresas FONAFE · Interior" value="0" hint="sin brazo empresarial" />
        <StatCard icon={Landmark} label="Presupuesto Defensa 2025" value={totalDefensa2025 ? `S/ ${(totalDefensa2025 / 1000).toFixed(1)} mil MM` : '—'} hint="PIA · fuente citada" />
        <StatCard icon={Landmark} label="Presupuesto Interior 2025" value={totalInterior2025 ? `S/ ${(totalInterior2025 / 1000).toFixed(1)} mil MM` : '—'} hint="PIA · fuente citada" />
      </div>

      {/* Asimetría */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">La asimetría que define al sector</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 font-semibold">Defensa — dimensión empresarial</div>
            <p className="text-muted-foreground">Tiene un <strong>brazo industrial real bajo FONAFE</strong>: SIMA, FAME y SEMAN. Hay finanzas corporativas, EBITDA, inversión y contrataciones que un tablero financiero puede monitorear.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 font-semibold">Interior — dimensión presupuestal</div>
            <p className="text-muted-foreground"><strong>No tiene empresas estatales.</strong> Es ministerio + PNP + superintendencias + el fondo SALUDPOL. Su materialidad está en el <strong>presupuesto y las compras</strong>, no en estados financieros de empresas.</p>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos panorama */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Presupuesto de apertura por sector" badge={<VerifiedBadge />}
          note="Interior supera a Defensa en presupuesto, pero es Defensa quien concentra la actividad empresarial del Estado en seguridad.">
          <Chart option={presupuestoOption} height={260} />
        </ChartCard>
        <ChartCard title="Ingresos por empresa (2025)" badge={<IllustrativeBadge />}
          note="Serie de demostración; SIMA ingresos 2023 ≈ S/ 1,818.7 MM verificados (FONAFE).">
          <Chart option={ingresosOption} height={260} />
        </ChartCard>
        <ChartCard title="Evolución de ingresos · 3 empresas" badge={<IllustrativeBadge />}
          note="Tendencia ilustrativa 2015–2025; se reemplaza por EE.FF. oficiales del cliente.">
          <Chart option={evoOption} height={260} />
        </ChartCard>
        <ChartCard title="Resultado neto por empresa (2025)" badge={<IllustrativeBadge />}
          note="FAME registra pérdidas (real 2024 ≈ −S/ 2.2 MM, ComexPerú/FONAFE); SIMA y SEMAN, utilidad.">
          <Chart option={netoOption} height={260} />
        </ChartCard>
        <ChartCard title="Trabajadores por empresa" badge={<VerifiedBadge />}
          note="SIMA 1,569 y FAME 73 verificados; SEMAN no publica plantilla (0 = sin dato).">
          <Chart option={empleadosOption} height={260} />
        </ChartCard>
        <div className="grid gap-4">
          {companies.map((c) => {
            const m = META[c.acronym]
            const Icon = m?.icon || Building2
            const facts = (c as { realFacts?: { metric: string; value: string; source_url?: string }[] }).realFacts || []
            return (
              <Card key={c.slug}>
                <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
                  <Icon className="h-5 w-5" style={{ color: m?.color }} />
                  <CardTitle className="text-sm">{c.acronym}</CardTitle>
                  <Badge variant="outline" className="ml-auto">{m?.rama}</Badge>
                </CardHeader>
                <CardContent className="space-y-1.5 pt-0 text-xs">
                  <div className="text-muted-foreground">{c.name}</div>
                  {facts.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <BadgeCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      <span><strong>{f.metric}:</strong> {f.value}</span>
                    </div>
                  ))}
                  <Link to={`/empresa/${c.slug}`} className="inline-flex items-center gap-1 pt-1 text-primary underline">
                    Ver ficha completa <ExternalLink className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Interior */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="h-4 w-4" /> Sector Interior — entidades y asignación 2025
        </h3>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {(sector?.interior?.entidades || []).map((x) => (
              <div key={x.n} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="font-medium">{x.n}</div>
                <div className="whitespace-nowrap text-right text-xs font-semibold">{x.v}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Nota metodológica */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 pt-6 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <p><strong className="text-foreground">Nota metodológica.</strong> Las <strong>series financieras</strong> de las empresas son <strong>ILUSTRATIVAS</strong> (demostración); se reemplazan por los EE.FF. oficiales del cliente. Los <strong>datos marcados «con fuente»</strong> (RUC, ingresos puntuales, empleados, presupuesto sectorial, contrataciones) están <strong>verificados</strong> con FONAFE, MEF, Congreso y prensa. Pendiente cotejar PIM y ejecución vía Consulta Amigable del MEF.</p>
        </CardContent>
      </Card>

      {/* Fuentes */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fuentes</CardTitle></CardHeader>
        <CardContent className="grid gap-1.5 text-xs sm:grid-cols-2">
          {(data.meta.sources || []).map((f) => (
            <a key={f.url} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              <ExternalLink className="h-3 w-3 shrink-0" /> {f.name}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Shield; label: string; value: string; hint: string }) {
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

function ChartCard({ title, badge, note, children }: { title: string; badge?: ReactNode; note?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {badge}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
        {note && <p className="mt-2 text-[11px] text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  )
}
