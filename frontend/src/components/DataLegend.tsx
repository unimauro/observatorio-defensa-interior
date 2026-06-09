/** Leyenda compartida: distingue dato real (con fuente) de supuesto (no publicado). */
export function DataLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" /> dato real (con fuente)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full border border-dashed border-amber-500 bg-amber-500/30" /> supuesto · no publicado (aprox.)
      </span>
    </div>
  )
}
