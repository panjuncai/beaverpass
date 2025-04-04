import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { userCache } from '@/lib/trpc'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const redirectTo = searchParams.get('redirectTo')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/search'

  // 如果有错误参数，记录错误信息
  if (error) {
    console.error('Auth callback error:', {
      error,
      error_description,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });
    // 可以重定向到错误页面
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  if (code) {
    const supabase = await createClient()
    console.log('Exchanging code for session...');
    
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', {
          error: error.message,
          code: error.status,
        });
        return NextResponse.redirect(new URL('/auth/error', origin))
      }

      if (session?.user) {
        console.log('Session created successfully:', {
          userId: session.user.id,
          email: session.user.email,
          timestamp: new Date().toISOString()
        });
        userCache.set(session.access_token, session.user)
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return NextResponse.redirect(new URL('/auth/error', origin))
    }
  }

  console.log('No code found in callback, redirecting to:', redirectTo || '/search');
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectTo || '/search', origin))
}