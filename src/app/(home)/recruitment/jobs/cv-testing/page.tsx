"use client";

import { CvTestingClient } from "@/components/recruitment/cv-testing-client";
import { useRequireAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function CvTestingPage() {
  const { isLoading } = useRequireAuth();

  useEffect(() => {
    document.title = "Kiểm thử CV Screening | TechLeet Admin";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <CvTestingClient />;
}
