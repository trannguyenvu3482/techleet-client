import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAuth(requireAuth: boolean = true) {
  const { isAuthenticated, user, token, logout, isHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after the store has been hydrated from localStorage
    if (isHydrated && requireAuth && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, requireAuth, router, isHydrated])

  const handleLogout = () => {
    logout()
    router.push('/sign-in')
  }

  return {
    isAuthenticated,
    user,
    token,
    logout: handleLogout,
    isLoading: !isHydrated || (requireAuth && !isAuthenticated),
  }
}

export function useRequireAuth() {
  return useAuth(true)
}

export function useOptionalAuth() {
  return useAuth(false)
}
