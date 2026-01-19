import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import Together from 'together-ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages } = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const apiKey = process.env.TOGETHER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Together.ai API key not configured' },
        { status: 500 }
      )
    }

    // Create a summary prompt
    const conversationText = messages
      .filter((msg: any) => !msg.is_ai_message) // Only user messages for context
      .slice(-20) // Last 20 user messages
      .map((msg: any) => msg.content)
      .join('\n')

    const summaryPrompt = `Please provide a brief summary (2-3 sentences) of the following conversation:\n\n${conversationText}`

    // Initialize Together.ai client
    const together = new Together({ apiKey })

    // Get summary from Together.ai
    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3-8b-chat-hf', // You can change this to any model you prefer
      messages: [
        { role: 'user', content: summaryPrompt },
      ],
      max_tokens: 200,
      temperature: 0.5,
    })

    const summary = response.choices[0]?.message?.content || `This conversation included ${messages.length} messages covering various topics.`

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Summary API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
