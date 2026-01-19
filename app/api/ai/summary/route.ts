import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

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

    // Create a summary prompt
    const conversationText = messages
      .filter((msg: any) => !msg.is_ai_message) // Only user messages for context
      .slice(-20) // Last 20 user messages
      .map((msg: any) => msg.content)
      .join('\n')

    const summaryPrompt = `Please provide a brief summary (2-3 sentences) of the following conversation:\n\n${conversationText}`

    // TODO: Replace with your AI API integration
    // Example with OpenAI:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: [{ role: 'user', content: summaryPrompt }],
    //     max_tokens: 150,
    //   }),
    // })
    // const data = await response.json()
    // const summary = data.choices[0].message.content

    // Placeholder response
    const summary = `This conversation included ${messages.length} messages covering various topics. [Configure your AI API in app/api/ai/summary/route.ts to generate real summaries]`

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Summary API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
