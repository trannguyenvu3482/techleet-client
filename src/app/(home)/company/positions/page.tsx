"use client";

import { PositionClient } from "@/components/company/position-client";
import { useRequireAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function PositionsPage() {
  const { isLoading } = useRequireAuth();

  useEffect(() => {
    document.title = "Position Management | TechLeet Admin";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return <PositionClient />;
}
