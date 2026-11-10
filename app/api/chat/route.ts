import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No hay mensajes para procesar.' }, { status: 400 })
    }

    const startedAt = performance.now()
    const result = await generateText({
      model: groq('qwen/qwen3.8-27b'),
      system: 'Eres un asistente útil, claro y conciso. Responde en español salvo que el usuario escriba en otro idioma.',
      messages: messages.map((message: { role: string; content: string }) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      })),
    })

    const usage = result.usage
    return NextResponse.json({
      text: result.text,
      model: 'qwen/qwen3.8-27b',
      latencyMs: Math.round(performance.now() - startedAt),
      usage: {
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
      },
    })
  } catch (error) {
    console.error('[chat] Groq request failed', error)
    return NextResponse.json({ error: 'No se pudo completar la respuesta. Revisa GROQ_API_KEY.' }, { status: 500 })
  }
}
