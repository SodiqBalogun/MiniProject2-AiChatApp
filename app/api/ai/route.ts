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

    const { message, outputMode } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.TOGETHER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Together.ai API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Together.ai client
    const together = new Together({ apiKey })

    // Get AI response from Together.ai (serverless model - no dedicated endpoint required)
    const response = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    })

    const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

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
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
