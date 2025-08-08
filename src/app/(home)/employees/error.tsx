"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function EmployeesError({ error, reset }: ErrorPageProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Trang chủ
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Danh sách nhân viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-4 pt-0">
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Danh sách nhân viên</h1>
              <p className="text-muted-foreground">
                Quản lý thông tin nhân viên trong công ty
              </p>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="flex justify-center">
                  <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Có lỗi xảy ra</h2>
                  <p className="text-muted-foreground">
                    Không thể tải danh sách nhân viên. Vui lòng thử lại sau.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="text-left mt-4">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        Chi tiết lỗi (chỉ hiển thị trong môi trường phát triển)
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {error.message}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={reset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Thử lại
                  </Button>
                  <Button onClick={() => window.location.href = '/'} variant="outline">
                    Về trang chủ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
