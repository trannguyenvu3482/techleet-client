"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ExamSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Nộp bài thành công!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Bài thi của bạn đã được nộp thành công và đang được xem xét.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Chúng tôi sẽ thông báo kết quả cho bạn trong thời gian sớm nhất.
          </p>
          
        </CardContent>
      </Card>
    </div>
  )
}
