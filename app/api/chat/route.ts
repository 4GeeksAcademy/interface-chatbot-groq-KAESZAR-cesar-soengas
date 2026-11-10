import { NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No hay mensajes para procesar.' }, { status: 400 })
    }

    const startedAt = performance.now()

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: 'Eres un asistente útil, claro y conciso. Responde en español salvo que el usuario escriba en otro idioma.' },
          ...messages.map(({ role, content }: { role: string; content: string }) => ({
            role: role as 'user' | 'assistant',
            content,
          })),
        ],
      }),
    })

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.json().catch(() => ({}))
      console.error('[chat] Groq API error', groqResponse.status, errorBody)
      return NextResponse.json(
        { error: errorBody.error?.message ?? 'La API de Groq respondió con un error.' },
        { status: groqResponse.status },
      )
    }

    const data = await groqResponse.json()
    const choice = data.choices?.[0]
    const usage = data.usage ?? {}

    return NextResponse.json({
      text: choice?.message?.content ?? '',
      model: data.model ?? 'qwen/qwen3.8-27b',
      latencyMs: Math.round(performance.now() - startedAt),
      usage: {
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
        totalTokens: usage.total_tokens ?? 0,
      },
    })
  } catch (error) {
    console.error('[chat] Groq request failed', error)
    return NextResponse.json(
      { error: 'No se pudo completar la respuesta. Revisa GROQ_API_KEY.' },
      { status: 500 },
    )
  }
}
