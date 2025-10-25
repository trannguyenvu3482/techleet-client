"use client"

import { useRequireAuth } from "@/hooks/use-auth"
import { useEffect } from "react"

interface PageWrapperProps {
  children: React.ReactNode
  title: string
  requireAuth?: boolean
}

export function PageWrapper({ children, title, requireAuth = true }: PageWrapperProps) {
  const { isLoading } = useRequireAuth()

  useEffect(() => {
    document.title = `${title} | TechLeet Admin`
  }, [title])

  if (requireAuth && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
