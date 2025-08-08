"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Đăng xuất thành công!')
        router.push('/sign-in')
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Đăng xuất thất bại')
    }
  }

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut />
      Đăng xuất
    </DropdownMenuItem>
  )
}
