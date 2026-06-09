import { useState } from 'react'
import { Anchor, Crosshair, Plane, ExternalLink, BadgeCheck } from 'lucide-react'
import { useData } from '@/data'
import { Chart } from '@/components/Chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, PageTitle } from '@/components/State'
import { DataLegend } from '@/components/DataLegend'
import { metricOption, counts, type Pt } from '@/lib/series'

const META: Record<string, { icon: typeof Anchor; color: string }> = {
  SIMA: { icon: Anchor, color: '#2563eb' },
  FAME: { icon: Crosshair, color: '#dc2626' },
  SEMAN: { icon: Plane, color: '#0891b2' },
}

const METRICS: { key: string; label: string; unit: string }[] = [
  { key: 'ingresos', label: 'Ingresos', unit: 'S/ MM' },
  { key: 'utilidad_neta', label: 'Utilidad neta', unit: 'S/ MM' },
  { key: 'patrimonio', label: 'Patrimonio', unit: 'S/ MM' },
  { key: 'roe', label: 'ROE', unit: '%' },
]

export function Empresas() {
  const { data, loading, error } = useData()
  if (loading) return <Loading />
  if (error || !data) return <ErrorState error={error || 'sin datos'} />
  const d = data as any

  return (
    <div className="space-y-6">
      <PageTitle
        title="Empresas del sector Defensa (FONAFE)"
        subtitle="SIMA (naval), FAME (armas/municiones) y SEMAN (aeronáutico). Series de EE.FF. auditados; los años no publicados se muestran como supuesto."
      />
      <DataLegend />
      {d.companies.map((c: any) => (
        <CompanyCard key={c.slug} c={c} />
      ))}
    </div>
  )
}

function CompanyCard({ c }: { c: any }) {
  const m = META[c.acronym] || { icon: Anchor, color: '#64748b' }
  const Icon = m.icon
  const available = METRICS.filter((mt) => (c.series?.[mt.key] || []).length > 0)
  const [metric, setMetric] = useState(available[0]?.key || 'ingresos')
  const pts: Pt[] = c.series?.[metric] || []
  const mt = METRICS.find((x) => x.key === metric)!
  const { real, est } = counts(pts)

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: m.color }} />
          <CardTitle className="text-base">{c.acronym}</CardTitle>
          <Badge variant="outline">{c.rama}</Badge>
          {c.ruc && <span className="ml-auto text-xs text-muted-foreground">RUC {c.ruc}</span>}
        </div>
        <p className="text-xs text-muted-foreground">{c.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Highlights */}
        <div className="grid gap-2 sm:grid-cols-2">
          {(c.highlights || []).map((h: any, i: number) => (
            <div key={i} className="flex items-start gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs">
              <BadgeCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              <span><strong>{h.label}:</strong> {h.value}</span>
            </div>
          ))}
        </div>

        {/* Selector de métrica */}
        {available.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {available.map((mt2) => (
                <button
                  key={mt2.key}
                  onClick={() => setMetric(mt2.key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${metric === mt2.key ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}
                >
                  {mt2.label}
                </button>
              ))}
            </div>
            <Chart option={metricOption(pts, m.color, mt.unit)} height={240} />
            <p className="text-[11px] text-muted-foreground">
              {mt.label}: {real} año(s) real(es) con fuente · {est} estimado(s). {est > 0 && 'Los años no publicados son interpolación/aproximación, no oficiales.'}
            </p>
          </>
        )}

        {/* Fuentes */}
        {(c.sources || []).length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px]">
            {c.sources.map((s: any) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> {s.name}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
