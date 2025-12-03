"use client";

import { Badge } from "@/components/ui/badge";
import { recruitmentAPI } from "@/lib/api";
import { useEffect, useState } from "react";

export function InterviewRequestsBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await recruitmentAPI.getInterviewRequests({ limit: 1 });
        setCount(response.total);
      } catch (error) {
        console.error("Failed to load interview requests count:", error);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  if (count === null || count === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2">
      {count}
    </Badge>
  );
}
