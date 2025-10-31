"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { examinationAPI, ExaminationDetail } from "@/lib/api/recruitment"

export function CandidateExamClient() {
  const params = useParams()
  const router = useRouter()
  const examinationId = params.examinationId ? Number(params.examinationId) : null

  const [exam, setExam] = useState<ExaminationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(60 * 60) // 60 minutes in seconds
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    const fetchExam = async () => {
      if (!examinationId) return

      try {
        setLoading(true)
        const data = await examinationAPI.getExaminationDetail(examinationId)
        console.log("Exam data:", data)
        setExam(data)

        // Check if already submitted
        if (data.status === "completed") {
          return
        }

        // Load saved answers from localStorage
        const savedAnswers = localStorage.getItem(`exam_${examinationId}_answers`)
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers))
        }

        // Load start time
        const savedStartTime = localStorage.getItem(`exam_${examinationId}_start`)
        if (savedStartTime) {
          const start = new Date(savedStartTime)
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000)
          const remaining = Math.max(0, timeRemaining - elapsed)
          setTimeRemaining(remaining)
          setStartTime(start)
          setStarted(true)
        }
      } catch (error) {
        console.error("Error fetching exam:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examinationId])

  // Countdown timer
  useEffect(() => {
    if (!started || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [started])

  // Auto-submit when time is up
  useEffect(() => {
    if (timeRemaining === 0 && started && exam) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining])

  const handleStartExam = () => {
    if (!examinationId) return

    const now = new Date()
    setStartTime(now)
    setStarted(true)
    localStorage.setItem(`exam_${examinationId}_start`, now.toISOString())
    localStorage.setItem(`exam_${examinationId}_end`, new Date(now.getTime() + 60 * 60 * 1000).toISOString())
  }

  const handleAnswerChange = (examQuestionId: number, answer: string) => {
    if (!examinationId) return

    setAnswers(prev => {
      const newAnswers = { ...prev, [examQuestionId]: answer }
      localStorage.setItem(`exam_${examinationId}_answers`, JSON.stringify(newAnswers))
      return newAnswers
    })
  }

  const handleSubmit = async () => {
    if (!exam || !examinationId || submitting || submitted) return

    // Show confirmation dialog
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn nộp bài thi không? Sau khi nộp, bạn sẽ không thể chỉnh sửa câu trả lời."
    )

    if (!confirmed) return

    try {
      setSubmitting(true)

      // Prepare answers in the format expected by the API
      const submitData: Record<string, { answerText: string }> = {}
      exam.examQuestions?.forEach(eq => {
        const answer = answers[eq.examinationQuestionId]
        if (answer) {
          submitData[eq.examinationQuestionId.toString()] = {
            answerText: answer
          }
        }
      })

      // Call API to submit exam - don't await, just fire and forget
      examinationAPI.submitExamination(examinationId, submitData).catch(error => {
        console.error("Error submitting exam:", error)
      })

      // Clear saved data
      localStorage.removeItem(`exam_${examinationId}_answers`)
      localStorage.removeItem(`exam_${examinationId}_start`)
      localStorage.removeItem(`exam_${examinationId}_end`)

      setSubmitted(true)
      
      // Navigate immediately without waiting for API response
      router.replace("/exam/success")
    } catch (error) {
      console.error("Error preparing submit:", error)
      setSubmitting(false)
      alert("Có lỗi xảy ra khi chuẩn bị nộp bài. Vui lòng thử lại.")
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy bài thi</h1>
        </div>
      </div>
    )
  }

  // Check if already submitted
  if (exam.status === "completed") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Bài thi đã được hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
              <p>
                Bạn đã hoàn thành bài thi này. Không thể làm lại.
              </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show start screen if not started
  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Bài thi số #{examinationId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Thông tin bài thi:</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Số câu hỏi: {exam.examQuestions?.length || 0}</li>
                <li>Thời gian làm bài: 60 phút</li>
                <li>Bạn có thể lưu câu trả lời bất kỳ lúc nào</li>
              </ul>
            </div>
            <p>
              <strong>Lưu ý:</strong> Thời gian làm bài sẽ bắt đầu khi bạn nhấn nút "Bắt đầu làm bài".
              Nếu bạn thoát trang, thời gian sẽ vẫn đếm ngược.
            </p>
            <Button onClick={handleStartExam} className="w-full" size="lg">
              Bắt đầu làm bài
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show exam interface
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header with timer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bài thi #{examinationId}</CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant={timeRemaining < 300 ? "destructive" : timeRemaining < 900 ? "default" : "secondary"}>
                  Còn lại: {formatTime(timeRemaining)}
                </Badge>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Đang nộp..." : "Nộp bài"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Questions */}
        {exam.examQuestions && exam.examQuestions.length > 0 ? (
          <div className="space-y-6">
            {exam.examQuestions.map((eq, index) => (
              <Card key={eq.examinationQuestionId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Câu hỏi {index + 1}</CardTitle>
                    <Badge
                      variant={eq.question?.difficulty === "easy" ? "default" : eq.question?.difficulty === "medium" ? "secondary" : "destructive"}
                    >
                      {eq.question?.difficulty === "easy" ? "Dễ" : eq.question?.difficulty === "medium" ? "Trung bình" : "Khó"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-base font-medium">{eq.question?.content}</div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Câu trả lời của bạn:</label>
                    <Textarea
                      value={answers[eq.examinationQuestionId] || ""}
                      onChange={(e) => handleAnswerChange(eq.examinationQuestionId, e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      rows={6}
                      className="resize-none"
                    />
                    {answers[eq.examinationQuestionId] && (
                      <p className="text-xs text-green-600">✓ Đã lưu</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Không có câu hỏi nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CandidateExamClient

