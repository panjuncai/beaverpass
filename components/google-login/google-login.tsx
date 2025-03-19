'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { generateNonce } from '@/lib/utils'
import Script from 'next/script'

// 为 window.google 添加类型定义
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback: (notification: any) => void) => void
        }
      }
    }
  }
}

export default function OneTapComponent() {
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      console.log('Initializing Google One Tap')
      
      try {
        const [nonce, hashedNonce] = await generateNonce()
        console.log('Nonce generated')

        // check if there's already an existing session
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session', error)
          return
        }
        
        if (data.session) {
          console.log('Existing session found')
          router.push('/search')
          return
        }

        if (typeof window.google === 'undefined') {
          console.error('Google script not loaded')
          return
        }

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: { credential: string }) => {
            try {
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce,
              })

              if (error) throw error
              console.log('Successfully logged in with Google One Tap')
              router.push('/search')
            } catch (error) {
              console.error('Error logging in with Google One Tap', error)
            }
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
        })

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason())
          } else if (notification.isSkippedMoment()) {
            console.log('One Tap skipped:', notification.getSkippedReason())
          } else if (notification.isDismissedMoment()) {
            console.log('One Tap dismissed:', notification.getDismissedReason())
          }
        })
      } catch (error) {
        console.error('Error initializing Google One Tap:', error)
      }
    }

    initializeGoogleOneTap()
  }, [router, supabase.auth])

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
    </>
  )
}
