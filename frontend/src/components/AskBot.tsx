import { useEffect, useRef, useState } from 'react'
import { Bot, X, Send, KeyRound, Loader2, Sparkles } from 'lucide-react'
import { useData } from '@/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Asistente conversacional del tablero.
 *
 * No es un MCP ni un backend: es un cliente ligero que inyecta el dataset del
 * tablero (3 empresas + contexto sectorial — cabe entero en el prompt) como
 * contexto y consulta a Gemini Flash directamente desde el navegador.
 *
 * La API key de Gemini se pide al usuario y se guarda SOLO en localStorage del
 * navegador (nunca se versiona ni se envía a ningún servidor nuestro).
 * Capa gratuita: https://aistudio.google.com/app/apikey
 */

const MODEL = 'gemini-2.0-flash'
const KEY_STORAGE = 'gemini_api_key'

type Msg = { role: 'user' | 'model'; text: string }

const SYSTEM = `Eres el asistente analítico del "Observatorio del Sector Defensa e Interior del Perú".
Respondes ÚNICAMENTE con base en el JSON de datos que se te entrega y en conocimiento público verificable del sector.
Reglas estrictas (anti-overclaiming):
- En las series, cada punto tiene "real": true (dato con fuente) o "real": false (SUPUESTO: estimado por interpolación/aproximación, no publicado). Si usas un punto supuesto, acláralo: "valor estimado, no publicado".
- Si un dato tiene fuente (sources/source_url), cítala.
- Si no sabes algo o no está en los datos, dilo. NUNCA inventes cifras.
- Sé conciso, claro y en español del Perú. Usa montos en S/ MM cuando corresponda.
- El tablero cubre 4 dimensiones: empresas (SIMA/FAME/SEMAN), presupuesto por pliego y proyectos, pensiones/salud/bienestar (CPMP, SALUDPOL) y remuneraciones por grado.`

export function AskBot() {
  const { data } = useData()
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setApiKey(localStorage.getItem(KEY_STORAGE) || '')
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  function saveKey(v: string) {
    setApiKey(v)
    localStorage.setItem(KEY_STORAGE, v.trim())
  }

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    if (!apiKey.trim()) { setErr('Pega tu API key de Gemini para conversar.'); return }
    setErr(null)
    const next: Msg[] = [...msgs, { role: 'user', text: q }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      const context = JSON.stringify(data ?? {}).slice(0, 120_000)
      const contents = [
        { role: 'user', parts: [{ text: `${SYSTEM}\n\n=== DATOS DEL TABLERO (JSON) ===\n${context}` }] },
        { role: 'model', parts: [{ text: 'Entendido. Analizaré solo con base en estos datos y seré claro sobre cifras ilustrativas vs. verificadas.' }] },
        ...next.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      ]
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } }),
        },
      )
      if (!res.ok) {
        const t = await res.text()
        throw new Error(res.status === 400 ? 'API key inválida o solicitud rechazada.' : `Error ${res.status}: ${t.slice(0, 160)}`)
      }
      const json = await res.json()
      const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') || 'Sin respuesta.'
      setMsgs((m) => [...m, { role: 'model', text }])
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const suggestions = [
    '¿Qué empresas del sector Defensa hay y qué hacen?',
    '¿Por qué el sector Interior no tiene empresas?',
    'Compara el presupuesto de Defensa vs Interior',
    '¿Qué cifras son ilustrativas y cuáles tienen fuente?',
  ]

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Asistente IA"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(70vh,560px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <div className="text-sm font-semibold">Asistente del tablero</div>
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Gemini Flash</span>
          </div>

          {/* API key */}
          {!apiKey.trim() && (
            <div className="border-b border-border bg-amber-500/10 px-4 py-3 text-xs">
              <label className="mb-1 flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                <KeyRound className="h-3.5 w-3.5" /> API key de Gemini (gratuita)
              </label>
              <input
                type="password"
                placeholder="Pega tu key de aistudio.google.com"
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                onChange={(e) => saveKey(e.target.value)}
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-primary underline">
                Obtener key gratis →
              </a>
              <p className="mt-1 text-[10px] text-muted-foreground">Se guarda solo en tu navegador.</p>
            </div>
          )}

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pregúntame sobre las empresas, el presupuesto o los datos del tablero:</p>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="block w-full rounded-md border border-border px-2.5 py-1.5 text-left text-xs hover:bg-muted">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] leading-relaxed',
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…
              </div>
            )}
            {err && <div className="rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">{err}</div>}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); ask(input) }}
            className="flex items-center gap-2 border-t border-border px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Enviar">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
