"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, Save } from "lucide-react"
import Link from "next/link"
import { examinationAPI, Examination, ExamQuestion } from "@/lib/api/recruitment"

export function CandidateExamsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const applicationIdParam = searchParams.get("applicationId")
  const applicationId = applicationIdParam ? Number(applicationIdParam) : undefined

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exams, setExams] = useState<Examination[]>([])
  const [editingScores, setEditingScores] = useState<Record<number, number>>({})

  useEffect(() => {
    const run = async () => {
      if (!applicationId) return
      try {
        setLoading(true)
        const data = await examinationAPI.getExaminationsToDo(applicationId)
        console.log("API Response:", data)
        setExams(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error("Error fetching exams:", e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [applicationId])

  const handleScoreChange = (examQuestionId: number, score: number) => {
    setEditingScores(prev => ({
      ...prev,
      [examQuestionId]: score
    }))
  }

  const handleSaveScores = async (exam: Examination) => {
    if (!exam.examQuestions) return

    try {
      setSaving(true)
      const updates: Array<{ examQuestionId: number; score: number }> = []
      
      exam.examQuestions.forEach(eq => {
        const newScore = editingScores[eq.examinationQuestionId]
        if (newScore !== undefined && newScore !== eq.score) {
          updates.push({
            examQuestionId: eq.examinationQuestionId,
            score: newScore
          })
        }
      })

      // Call API to update scores for all questions
      if (updates.length > 0) {
        console.log("Saving scores:", updates)
        
        // Update each question's score individually
        await Promise.all(
          updates.map(update => 
            examinationAPI.updateExamScore(update.examQuestionId, update.score)
          )
        )
        
        // Reload exams after update
        const data = await examinationAPI.getExaminationsToDo(applicationId!)
        setExams(Array.isArray(data) ? data : [])
        setEditingScores({})
      }
    } catch (e) {
      console.error("Error saving scores:", e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-semibold">Danh sách bài thi</h1>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">Đang tải...</CardContent>
        </Card>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Không có bài thi.</CardContent>
        </Card>
      ) : (
        exams.map((exam) => (
          <Card key={exam.examinationId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Bài thi #{exam.examinationId}</span>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{String(exam.status || "N/A")}</Badge>
                  <Badge variant={exam.totalScore !== null && exam.totalScore !== undefined ? "default" : "outline"}>
                    Điểm TB: {exam.totalScore !== null && exam.totalScore !== undefined ? `${(exam.totalScore || 0).toFixed(1)}/10` : "-"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={() => handleSaveScores(exam)}
                  disabled={saving || Object.keys(editingScores).length === 0}
                  size="sm"
                >
                  {saving ? (
                    <span>Đang lưu...</span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu điểm
                    </>
                  )}
                </Button>
              </div>
              {exam.examQuestions && exam.examQuestions.length > 0 ? (
                <div className="space-y-4">
                  {exam.examQuestions.map((eq, index) => (
                    <div key={eq.examinationQuestionId} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">Câu hỏi {index + 1}</h4>
                        <Badge
                          variant={eq.question?.difficulty === "easy" ? "default" : eq.question?.difficulty === "medium" ? "secondary" : "destructive"}
                        >
                          {eq.question?.difficulty === "easy" ? "Dễ" : eq.question?.difficulty === "medium" ? "Trung bình" : "Khó"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {eq.question?.content}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>Đáp án:</strong>
                        </div>
                        <div className="text-sm">
                          {eq.answerText ? (
                            <div className="bg-gray-50 border rounded p-3">
                              {eq.answerText}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Chưa có câu trả lời</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`score-${eq.examinationQuestionId}`} className="font-medium">Điểm:</Label>
                          <Input
                            id={`score-${eq.examinationQuestionId}`}
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={editingScores[eq.examinationQuestionId] ?? eq.score ?? 0}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 0 && val <= 10) {
                                handleScoreChange(eq.examinationQuestionId, val);
                              }
                            }}
                            className="w-24"
                            placeholder="0-10"
                          />
                          <span className="text-muted-foreground">/10</span>
                        </div>
                        {eq.reason && (
                          <span className="text-muted-foreground text-xs">({eq.reason})</span>
                        )}
                      </div>
                      {eq.question?.sampleAnswer && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:underline">
                            Xem đáp án mẫu
                          </summary>
                          <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                            {eq.question.sampleAnswer}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Không có câu hỏi nào
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default CandidateExamsClient


