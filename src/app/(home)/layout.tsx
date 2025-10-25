"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AdminChatBot } from "@/components/chatbot/admin-chatbot";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

// Map paths to breadcrumb titles
const pathTitles: Record<string, string> = {
  "/": "Dashboard",
  "/employees": "Nhân viên",
  "/documents": "Tài liệu",
  "/recruitment": "Tuyển dụng",
  "/company": "Công ty",
  "/settings": "Cài đặt",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireAuth();
  const pathname = usePathname();

  // Get the current page title from pathname
  const currentTitle = pathTitles[pathname] || "Dashboard";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="max-w-full overflow-hidden">
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
                    <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4 pt-0 w-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <AdminChatBot />
    </>
  );
}
