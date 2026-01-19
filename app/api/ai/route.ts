import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// You can use Together.ai or OpenAI API here
// For now, this is a placeholder that you'll need to configure with your API key

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, outputMode } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

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
    //     messages: [{ role: 'user', content: message }],
    //   }),
    // })

    // For now, return a placeholder response
    const aiResponse = `AI Response to: "${message}"\n\n[Configure your AI API (OpenAI/Together.ai) in app/api/ai/route.ts]`

    // Insert AI message into database
    const { data: aiMessage, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: aiResponse,
        is_ai_message: true,
        ai_output_mode: outputMode || 'public',
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting AI message:', error)
      return NextResponse.json({ error: 'Failed to save AI response' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: aiMessage })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
