"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/Home/LoginForm";
import { GalleryVerticalEnd } from "lucide-react";
import { useOptionalAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { isAuthenticated } = useOptionalAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            TechLeet.
          </a>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
