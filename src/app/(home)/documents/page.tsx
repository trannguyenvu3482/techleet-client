"use client"

import { useEffect } from "react"
import { DocumentClient } from "@/components/documents/document-client"

export default function DocumentsPage() {
  useEffect(() => {
    document.title = "Quản lý tài liệu | TechLeet Admin"
  }, [])

  return <DocumentClient />
}
