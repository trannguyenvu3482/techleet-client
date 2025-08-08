"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function RedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and redirect to employees page
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]
    
    if (token) {
      router.push('/employees')
    }
  }, [router])

  return null // This component doesn't render anything
}
