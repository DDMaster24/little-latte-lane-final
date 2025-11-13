import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Auth Endpoint Called')

    // Check what cookies we're receiving
    const allCookies = request.cookies.getAll()
    console.log('📦 Cookies received:', allCookies.map(c => c.name))

    const supabaseCookies = allCookies.filter(c =>
      c.name.includes('supabase') || c.name.includes('auth')
    )
    console.log('🔐 Supabase auth cookies:', supabaseCookies.map(c => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value?.length || 0
    })))

    // Try to get user with server client
    const supabase = await getSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('👤 Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message,
      errorStatus: authError?.status
    })

    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log('🎫 Session result:', {
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      expiresAt: session?.expires_at,
      error: sessionError?.message
    })

    // If user exists, check profile
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_admin, is_staff')
        .eq('id', user.id)
        .single()

      console.log('👔 Profile result:', {
        hasProfile: !!profile,
        isAdmin: profile?.is_admin,
        isStaff: profile?.is_staff,
        error: profileError?.message
      })

      return NextResponse.json({
        success: true,
        auth: {
          authenticated: true,
          userId: user.id,
          email: user.email,
          profile: profile || null,
        },
        cookies: {
          total: allCookies.length,
          supabaseCookies: supabaseCookies.length,
          names: allCookies.map(c => c.name)
        }
      })
    }

    // No user found
    return NextResponse.json({
      success: false,
      auth: {
        authenticated: false,
        error: authError?.message || 'No user found',
        errorStatus: authError?.status
      },
      cookies: {
        total: allCookies.length,
        supabaseCookies: supabaseCookies.length,
        names: allCookies.map(c => c.name)
      },
      hint: 'Session might be expired or cookies not being sent correctly'
    }, { status: 401 })

  } catch (error) {
    console.error('❌ Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
