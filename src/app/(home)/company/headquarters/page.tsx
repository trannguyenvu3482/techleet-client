"use client";

import { HeadquarterClient } from "@/components/company/headquarter-client";
import { useRequireAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function HeadquartersPage() {
  const { isLoading } = useRequireAuth();

  useEffect(() => {
    document.title = "Headquarters Management | TechLeet Admin";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return <HeadquarterClient />;
}
