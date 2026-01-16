import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, source, timestamp, metadata } = body

    if (!event || !source) {
      return NextResponse.json(
        { error: '이벤트와 출처는 필수입니다.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: '데이터베이스 연결 설정이 필요합니다.' },
        { status: 500 }
      )
    }

    // 추적 데이터 저장
    const { data, error } = await supabase
      .from('tracking_logs')
      .insert([
        {
          event,
          source,
          timestamp: timestamp || new Date().toISOString(),
          metadata: metadata || {},
        },
      ])
      .select()

    if (error) {
      console.error('Tracking error:', error)
      return NextResponse.json(
        { error: '추적 데이터 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
