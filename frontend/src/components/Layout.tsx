import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard, Building2, FileText, ShieldCheck, BrainCircuit, Database, SlidersHorizontal,
  Sun, Moon, Github, Menu, X, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useData } from '@/data'
import { useIsDark, toggleTheme } from './theme'
import { Badge } from './ui/badge'
import { AskBot } from './AskBot'

const NAV = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/sector', label: 'Defensa e Interior', icon: Shield },
  { to: '/empresas', label: 'Empresas', icon: Building2 },
  { to: '/contrataciones', label: 'Contrataciones', icon: FileText },
  { to: '/transparencia', label: 'Transparencia', icon: ShieldCheck },
  { to: '/decisiones', label: 'Decisiones · IA', icon: BrainCircuit },
  { to: '/simuladores', label: 'Simuladores', icon: SlidersHorizontal },
  { to: '/datos', label: 'Datos abiertos', icon: Database },
]

function NavItems({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <n.icon className="h-4 w-4" />
          {n.label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold">D</div>
      <div className="leading-tight">
        <div className="text-sm font-bold">Sector Defensa e Interior</div>
        <div className="text-[11px] text-muted-foreground">Tablero financiero · Perú</div>
      </div>
    </Link>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const dark = useIsDark()
  const { data } = useData()
  const meta = data?.meta

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card/60 p-4 lg:flex">
        <Brand />
        <div className="mt-6"><NavItems /></div>
        <div className="mt-auto space-y-2 text-[11px] text-muted-foreground">
          {meta && (
            <div className="rounded-lg border border-border p-2">
              <div>Versión {meta.version}</div>
              <div>Datos al {meta.generated_at}</div>
              {meta.is_illustrative && <Badge variant="warning" className="mt-1">financieros ilustrativos · contratos reales</Badge>}
            </div>
          )}
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:pl-72">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menú">
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden"><Brand /></div>
        <div className="ml-auto flex items-center gap-2">
          {data?.contracts?.isReal && <Badge variant="success" className="hidden md:inline-flex">contratos: reales</Badge>}
          {meta?.is_illustrative && <Badge variant="warning" className="hidden sm:inline-flex">financieros: ilustrativos</Badge>}
          <button onClick={toggleTheme} aria-label="Tema" className="rounded-md p-2 hover:bg-muted">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href="https://github.com/unimauro/observatorio-defensa-interior" target="_blank" rel="noopener"
             className="rounded-md p-2 hover:bg-muted" aria-label="GitHub">
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6"><NavItems onClick={() => setOpen(false)} /></div>
          </div>
        </div>
      )}

      <main className="px-4 py-6 lg:pl-72">
        <div className="mx-auto max-w-6xl">
          <Outlet />
          <footer className="mt-10 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Observatorio del Sector Defensa e Interior del Perú.</strong>{' '}
              Desarrollado por <a href="https://unimauro.github.io" target="_blank" rel="noopener" className="text-primary hover:underline">Carlos Cárdenas Fernández</a>.
            </p>
            <p className="mt-1">
              Cómo leer los datos: las <strong>series financieras de las empresas son ilustrativas</strong> (demostración); los datos
              marcados «con fuente» (RUC, ingresos puntuales, empleados, presupuesto sectorial, contrataciones) están
              <strong> verificados</strong> con FONAFE, MEF, Congreso, OECE/OCDS y prensa. Se reemplazan por los EE.FF. oficiales del cliente.
            </p>
          </footer>
        </div>
      </main>

      <AskBot />
    </div>
  )
}
