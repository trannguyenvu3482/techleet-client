"use client"

import { useEffect } from "react"
import { EmployeeManagement } from "@/components/employees/employee-management"

export default function EmployeesPage() {
  useEffect(() => {
    document.title = "Quản lý nhân sự | TechLeet Admin"
  }, [])

  return <EmployeeManagement />
}
