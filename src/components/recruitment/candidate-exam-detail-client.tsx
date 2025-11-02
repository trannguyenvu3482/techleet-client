"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { examinationAPI, ExaminationDetail } from "@/lib/api/recruitment"

export function CandidateExamDetailClient() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [exam, setExam] = useState<ExaminationDetail | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!params.id) return
      try {
        setLoading(true)
        const data = await examinationAPI.getExaminationDetail(Number(params.id))
        setExam(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-semibold">Chi tiết bài thi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bài thi #{params.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Đang tải...</div>
          ) : !exam ? (
            <div className="py-8 text-center text-muted-foreground">Không tìm thấy bài thi.</div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Trạng thái</span>
                  <div>
                    <Badge variant="secondary">{String(exam.status || "N/A")}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Điểm</span>
                  <div className="font-medium">
                    {exam.totalScore !== null && exam.totalScore !== undefined 
                      ? exam.totalScore.toString() 
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Optional: render questions if present */}
              {Array.isArray(exam.questions) && exam.questions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Câu hỏi</div>
                  <ul className="list-disc pl-6 space-y-1">
                    {exam.questions.map((q: any, idx: number) => (
                      <li key={idx}>
                        {q?.content || `Câu ${idx + 1}`}
                        {typeof q?.score !== "undefined" && (
                          <span className="ml-2 text-muted-foreground">(Điểm: {q.score})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CandidateExamDetailClient


