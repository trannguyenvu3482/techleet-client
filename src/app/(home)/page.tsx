"use client"

import { useEffect } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard | TechLeet Admin"
  }, [])

  return <DashboardContent />
}
