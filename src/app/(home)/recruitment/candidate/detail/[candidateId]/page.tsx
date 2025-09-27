"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CandidateDetailClient } from "@/components/recruitment/candidate-detail-client";
import { useRequireAuth } from "@/hooks/use-auth";

export default function CandidateDetailPage() {
  const { isLoading } = useRequireAuth();

  useEffect(() => {
    document.title = "Chi tiết ứng viên | TechLeet Admin";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <CandidateDetailClient />;
}
