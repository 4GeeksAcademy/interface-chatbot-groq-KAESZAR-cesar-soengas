'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Activity, ArrowUp, Bot, BrainCircuit, Check, Clock3, Copy, Database, Gauge, Menu, MessageSquareText, MoreHorizontal, Plus, RotateCcw, Sparkles, UserRound, X } from 'lucide-react'

type Message = { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }
type Usage = { promptTokens: number; completionTokens: number; totalTokens: number; requests: number; latencyMs: number; model: string }

const starterMessages: Message[] = [
  { id: 'welcome', role: 'assistant', content: 'Hola, soy Qwen. Puedo ayudarte a explorar ideas, resumir textos o resolver problemas. ¿Qué te gustaría hacer hoy?', createdAt: 'Ahora' },
]
const emptyUsage: Usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0, latencyMs: 0, model: 'qwen/qwen3.8-27b' }
const suggestions = ['Explícame cómo funciona la caché', 'Resume las novedades de Next.js', 'Ayúdame a estructurar una idea']

function formatNumber(value: number) { return new Intl.NumberFormat('es-ES').format(value) }

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(starterMessages)
  const [usage, setUsage] = useState<Usage>(emptyUsage)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedMessages = window.localStorage.getItem('qwen-chat-messages')
    const savedUsage = window.localStorage.getItem('qwen-chat-usage')
    if (savedMessages) setMessages(JSON.parse(savedMessages))
    if (savedUsage) setUsage({ ...emptyUsage, ...JSON.parse(savedUsage) })
  }, [])

  useEffect(() => { window.localStorage.setItem('qwen-chat-messages', JSON.stringify(messages)) }, [messages])
  useEffect(() => { window.localStorage.setItem('qwen-chat-usage', JSON.stringify(usage)) }, [usage])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const tokenTotal = useMemo(() => usage.promptTokens + usage.completionTokens, [usage])
  const averageLatency = usage.requests ? Math.round(usage.latencyMs / usage.requests) : 0

  async function sendMessage(event?: FormEvent, value?: string) {
    event?.preventDefault()
    const text = (value ?? input).trim()
    if (!text || isLoading) return
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: 'Ahora' }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages.filter((message) => message.id !== 'welcome').map(({ role, content }) => ({ role, content })) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: data.text, createdAt: 'Ahora' }])
      setUsage((current) => ({
        ...current,
        promptTokens: current.promptTokens + (data.usage?.promptTokens ?? 0),
        completionTokens: current.completionTokens + (data.usage?.completionTokens ?? 0),
        totalTokens: current.totalTokens + (data.usage?.totalTokens ?? 0),
        requests: current.requests + 1,
        latencyMs: current.latencyMs + (data.latencyMs ?? 0),
        model: data.model ?? current.model,
      }))
    } catch (error) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: error instanceof Error ? error.message : 'Ocurrió un error inesperado.', createdAt: 'Ahora' }])
    } finally { setIsLoading(false) }
  }

  function clearConversation() { setMessages(starterMessages); setUsage(emptyUsage) }
  async function copyMessage(message: Message) { await navigator.clipboard.writeText(message.content); setCopiedId(message.id); window.setTimeout(() => setCopiedId(null), 1600) }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#171a2b] selection:bg-indigo-100">
      <div className="mx-auto flex min-h-screen max-w-[1540px] flex-col border-x border-[#e7e9f2] bg-white lg:flex-row">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 flex w-[274px] flex-col border-r border-[#e8eaf1] bg-[#fbfbfe] transition-transform duration-200 lg:static lg:translate-x-0`}>
          <div className="flex h-[74px] items-center justify-between border-b border-[#e8eaf1] px-6">
            <div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center rounded-[10px] bg-[#6862e7] text-white shadow-sm"><Sparkles className="size-4" /></div><span className="text-[15px] font-semibold tracking-tight">Qwen workspace</span></div>
            <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" className="rounded-md p-1.5 text-[#9a9eb0] hover:bg-[#eff0f7] lg:hidden"><X className="size-4" /></button>
          </div>
          <div className="flex-1 px-4 py-5">
            <button className="flex w-full items-center gap-2.5 rounded-xl border border-[#e1e2f1] bg-white px-3.5 py-3 text-left text-[13px] font-medium text-[#5753bf] shadow-[0_2px_7px_rgba(39,39,90,0.04)]"><Plus className="size-4" />Nueva conversación</button>
            <div className="mt-7"><p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a2a5b5]">Historial</p><div className="mt-2 rounded-xl bg-[#f0effd] px-3.5 py-3 text-[12px] font-medium text-[#514db7]"><div className="flex items-center gap-2"><MessageSquareText className="size-3.5" />Sesión actual</div><p className="mt-1 truncate pl-5 text-[11px] font-normal text-[#8584bb]">{messages.length - 1 ? `${messages.length - 1} mensajes` : 'Sin mensajes todavía'}</p></div></div>
          </div>
          <div className="border-t border-[#e8eaf1] px-5 py-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center rounded-full bg-[#e7e8f7] text-[#5b59bf]"><UserRound className="size-4" /></div><div><p className="text-[12px] font-semibold">Invitado</p><p className="text-[10px] text-[#999cac]">Plan gratuito</p></div></div><MoreHorizontal className="size-4 text-[#a6a9b6]" /></div></div>
        </aside>
        {sidebarOpen && <button aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-10 bg-[#171a2b]/20 lg:hidden" />}

        <section className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-[#e8eaf1] px-5 sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" className="rounded-lg p-1.5 text-[#777b91] hover:bg-[#f2f3f8] lg:hidden"><Menu className="size-5" /></button><div><h1 className="text-[15px] font-semibold tracking-[-0.02em]">Asistente Qwen</h1><div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#989baa]"><span className="size-1.5 rounded-full bg-[#3fba77]" />Conectado a Groq <span className="text-[#c4c6d0]">·</span> Sesión persistente</div></div></div><button onClick={clearConversation} className="flex items-center gap-2 rounded-lg border border-[#e6e7ef] px-3 py-2 text-[11px] font-medium text-[#777b8d] transition-colors hover:bg-[#f7f7fb]"><RotateCcw className="size-3.5" /> <span className="hidden sm:inline">Limpiar sesión</span></button></header>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-[840px] flex-1 flex-col overflow-y-auto px-5 py-8 sm:px-10"><div className="mb-8 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-[13px] bg-[#eeedff] text-[#6862e7]"><BrainCircuit className="size-5" /></div><div><p className="text-[13px] font-semibold">Conversación nueva</p><p className="mt-0.5 text-[11px] text-[#989baa]">Tus mensajes se guardan automáticamente en este dispositivo</p></div></div>
              <div className="flex flex-col gap-7">{messages.map((message) => <div key={message.id} className={`group flex gap-3.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>{message.role === 'assistant' && <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-[#6862e7] text-white"><Bot className="size-4" /></div>}<div className={`max-w-[78%] ${message.role === 'user' ? 'order-first' : ''}`}><div className={`${message.role === 'user' ? 'rounded-2xl rounded-tr-md bg-[#6862e7] text-white' : 'rounded-2xl rounded-tl-md border border-[#e9eaf2] bg-[#fbfbfd] text-[#36394b]'} px-4 py-3.5 text-[13px] leading-6 shadow-[0_2px_7px_rgba(30,34,70,0.025)]`}><p className="whitespace-pre-wrap">{message.content}</p></div><div className={`mt-2 flex items-center gap-2 text-[10px] text-[#b0b2bf] ${message.role === 'user' ? 'justify-end' : ''}`}><span>{message.createdAt}</span>{message.role === 'assistant' && <button onClick={() => copyMessage(message)} aria-label="Copiar mensaje" className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#6862e7]">{copiedId === message.id ? <Check className="size-3" /> : <Copy className="size-3" />}</button>}</div></div>{message.role === 'user' && <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-[#f0f1f7] text-[#74788c]"><UserRound className="size-4" /></div>}</div>)}{isLoading && <div className="flex gap-3.5"><div className="mt-1 flex size-7 items-center justify-center rounded-[9px] bg-[#6862e7] text-white"><Bot className="size-4" /></div><div className="rounded-2xl rounded-tl-md border border-[#e9eaf2] bg-[#fbfbfd] px-4 py-4"><div className="flex gap-1"><span className="size-1.5 animate-bounce rounded-full bg-[#a19eea]" /><span className="size-1.5 animate-bounce rounded-full bg-[#a19eea] [animation-delay:120ms]" /><span className="size-1.5 animate-bounce rounded-full bg-[#a19eea] [animation-delay:240ms]" /></div></div></div>}<div ref={bottomRef} /></div>
              {messages.length === 1 && <div className="mt-10 grid gap-2 sm:grid-cols-3">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(undefined, suggestion)} className="rounded-xl border border-[#e8e9f1] bg-white px-3 py-3 text-left text-[11px] leading-4 text-[#72768a] transition hover:border-[#c6c4f1] hover:bg-[#fbfaff]">{suggestion}<ArrowUp className="mt-2 size-3.5 rotate-45 text-[#9b99e0]" /></button>)}</div>}
            </div>
            <div className="mx-auto w-full max-w-[840px] px-5 pb-7 sm:px-10"><form onSubmit={sendMessage} className="relative rounded-2xl border border-[#dfe1eb] bg-white p-2 shadow-[0_5px_24px_rgba(41,44,91,0.06)] focus-within:border-[#aaa7e7] focus-within:ring-4 focus-within:ring-[#6862e7]/5"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage() } }} placeholder="Escribe tu mensaje..." rows={2} aria-label="Mensaje para Qwen" className="w-full resize-none border-0 bg-transparent px-3 py-2 text-[13px] leading-6 outline-none placeholder:text-[#b0b2bf]" /><div className="flex items-center justify-between px-2 pb-1"><span className="text-[10px] text-[#b0b2bf]">Enter para enviar · Shift + Enter para nueva línea</span><button type="submit" disabled={!input.trim() || isLoading} aria-label="Enviar mensaje" className="flex size-8 items-center justify-center rounded-[10px] bg-[#6862e7] text-white transition hover:bg-[#5752d1] disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp className="size-4" /></button></div></form><p className="mt-3 text-center text-[10px] text-[#b5b7c2]">Qwen puede cometer errores. Verifica la información importante.</p></div>
          </div>
        </section>

        <aside className="hidden w-[292px] shrink-0 border-l border-[#e8eaf1] bg-[#fbfbfe] xl:block"><div className="flex h-[74px] items-center border-b border-[#e8eaf1] px-6"><div><h2 className="text-[13px] font-semibold">Consumo de sesión</h2><p className="mt-1 text-[10px] text-[#9a9dac]">Métricas en tiempo real</p></div></div><div className="flex flex-col gap-3 px-5 py-6"><div className="rounded-2xl bg-[#6862e7] p-4 text-white shadow-[0_8px_20px_rgba(104,98,231,0.2)]"><div className="flex items-center justify-between"><span className="text-[11px] font-medium text-indigo-100">Tokens totales</span><Gauge className="size-4 text-indigo-200" /></div><p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]">{formatNumber(tokenTotal)}</p><div className="mt-3 flex items-center gap-1.5 text-[10px] text-indigo-100"><Activity className="size-3" /> {usage.requests} {usage.requests === 1 ? 'solicitud' : 'solicitudes'} realizadas</div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-[#e8e9f1] bg-white p-3.5"><p className="text-[10px] text-[#989baa]">Prompt</p><p className="mt-2 text-[17px] font-semibold tracking-tight">{formatNumber(usage.promptTokens)}</p><p className="mt-1 text-[9px] text-[#b0b2bf]">tokens entrada</p></div><div className="rounded-xl border border-[#e8e9f1] bg-white p-3.5"><p className="text-[10px] text-[#989baa]">Completado</p><p className="mt-2 text-[17px] font-semibold tracking-tight">{formatNumber(usage.completionTokens)}</p><p className="mt-1 text-[9px] text-[#b0b2bf]">tokens salida</p></div></div><div className="mt-3 border-t border-[#e8e9f1] pt-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a2a5b5]">Detalles del modelo</p><div className="flex flex-col gap-3"><div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 text-[#8b8e9f]"><Database className="size-3.5" />Modelo</span><span className="font-mono text-[10px] text-[#55586e]">{usage.model}</span></div><div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 text-[#8b8e9f]"><Clock3 className="size-3.5" />Latencia media</span><span className="font-medium text-[#55586e]">{averageLatency ? `${averageLatency} ms` : '—'}</span></div><div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 text-[#8b8e9f]"><Gauge className="size-3.5" />Última respuesta</span><span className="font-medium text-[#55586e]">{usage.latencyMs ? `${usage.latencyMs} ms` : '—'}</span></div></div></div></div><div className="mx-5 mt-3 rounded-xl border border-dashed border-[#dfe1eb] px-3.5 py-3 text-[10px] leading-4 text-[#989baa]">Los datos de uso se conservan junto con tu historial para que puedas retomar la sesión después de recargar.</div></aside>
      </div>
    </main>
  )
}
