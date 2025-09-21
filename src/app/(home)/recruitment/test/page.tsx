"use client"

import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRequireAuth } from "@/hooks/use-auth"
import { Users, FileText, Eye, ExternalLink, User } from "lucide-react"

export default function RecruitmentTestPage() {
  const { isLoading } = useRequireAuth()

  useEffect(() => {
    document.title = "Test Recruitment Pages | TechLeet Admin"
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
                <BreadcrumbItem>
                  <BreadcrumbLink href="/recruitment">Tuyển dụng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Test Pages</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            {/* Header Section */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Test Recruitment Pages</h1>
              <p className="text-muted-foreground">
                Trang test cho các chức năng tuyển dụng với mock data
              </p>
            </div>

            {/* Test Links */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Candidate List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Danh sách ứng viên
                  </CardTitle>
                  <CardDescription>
                    Xem danh sách tất cả ứng viên với mock data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Link href="/recruitment/candidate/list">
                      <Button className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem danh sách ứng viên
                      </Button>
                    </Link>
                    <Link href="/recruitment/candidate/list?jobId=1">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Ứng viên Frontend Developer
                      </Button>
                    </Link>
                    <Link href="/recruitment/candidate/list?jobId=2">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Ứng viên Backend Developer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Detail */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Chi tiết ứng viên
                  </CardTitle>
                  <CardDescription>
                    Xem thông tin chi tiết ứng viên với mock data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Link href="/recruitment/candidate/detail/1">
                      <Button className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Nguyễn Văn An (General)
                      </Button>
                    </Link>
                    <Link href="/recruitment/candidate/detail/1?applicationId=101">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Nguyễn Văn An (Frontend App)
                      </Button>
                    </Link>
                    <Link href="/recruitment/candidate/detail/1?applicationId=102">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Nguyễn Văn An (Backend App)
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Job Detail with CV Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Detail với CV Link
                  </CardTitle>
                  <CardDescription>
                    Test link từ job detail đến candidate list
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Link href="/recruitment/jobs/1">
                      <Button className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Job Detail (ID: 1)
                      </Button>
                    </Link>
                    <Link href="/recruitment/jobs/2">
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Job Detail (ID: 2)
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Test */}
            <Card>
              <CardHeader>
                <CardTitle>Chức năng đã test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">✅ Đã hoàn thành:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Danh sách ứng viên với mock data</li>
                      <li>• Lọc theo job posting</li>
                      <li>• Sắp xếp theo ngày tạo và điểm số</li>
                      <li>• Tìm kiếm theo tên và email</li>
                      <li>• Chi tiết ứng viên với đầy đủ thông tin</li>
                      <li>• Quản lý trạng thái CV</li>
                      <li>• Lịch sử ứng tuyển</li>
                      <li>• Link từ job detail đến candidate list</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🎯 Mock Data bao gồm:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 5 ứng viên với các trạng thái khác nhau</li>
                      <li>• 2 job postings (Frontend & Backend)</li>
                      <li>• Điểm số CV screening (85%, 92%, null)</li>
                      <li>• Thông tin cá nhân đầy đủ</li>
                      <li>• Kỹ năng và ngôn ngữ lập trình</li>
                      <li>• Thông tin học vấn và kinh nghiệm</li>
                      <li>• Social links (LinkedIn, GitHub, Portfolio)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
