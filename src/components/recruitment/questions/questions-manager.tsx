"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { questionAPI, Question, CreateQuestionRequest, UpdateQuestionRequest } from "@/lib/api/recruitment"

export function QuestionsManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [page, setPage] = useState(0)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchText, setSearchText] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("")
  const [formData, setFormData] = useState({
    content: "",
    sampleAnswer: "",
    difficulty: "medium" as "easy" | "medium" | "hard"
  })

  useEffect(() => {
    fetchQuestions()
  }, [page, difficultyFilter, searchText])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await questionAPI.getQuestions({
        page,
        limit,
        text: searchText,
        difficulty: difficultyFilter || undefined
      })
      setQuestions(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const handleSearch = (value: string) => {
    setSearchText(value)
    setPage(0)
  }

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        content: question.content,
        sampleAnswer: question.sampleAnswer,
        difficulty: question.difficulty
      })
    } else {
      setEditingQuestion(null)
      setFormData({
        content: "",
        sampleAnswer: "",
        difficulty: "medium"
      })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingQuestion(null)
    setFormData({
      content: "",
      sampleAnswer: "",
      difficulty: "medium"
    })
  }

  const handleSubmit = async () => {
    try {
      if (editingQuestion) {
        const updateData: UpdateQuestionRequest = {
          content: formData.content,
          sampleAnswer: formData.sampleAnswer,
          difficulty: formData.difficulty
        }
        await questionAPI.updateQuestion(editingQuestion.questionId, updateData)
      } else {
        const createData: CreateQuestionRequest = {
          content: formData.content,
          sampleAnswer: formData.sampleAnswer,
          difficulty: formData.difficulty
        }
        await questionAPI.createQuestion(createData)
      }
      await fetchQuestions()
      handleCloseDialog()
    } catch (error) {
      console.error("Error saving question:", error)
    }
  }

  const handleDelete = async (questionId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return
    
    try {
      await questionAPI.deleteQuestion(questionId)
      await fetchQuestions()
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý câu hỏi</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các câu hỏi tuyển dụng
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo câu hỏi mới
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh sách câu hỏi</h2>
          <p className="text-muted-foreground">
            {total} câu hỏi trong hệ thống
          </p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select value={difficultyFilter || "all"} onValueChange={(val) => { setDifficultyFilter(val === "all" ? "" : val); setPage(0); }}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="easy">Dễ</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="hard">Khó</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có câu hỏi nào. Hãy tạo câu hỏi mới.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Độ khó</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.questionId}>
                    <TableCell className="max-w-md truncate">
                      {question.content}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                        question.difficulty === "easy" ? "bg-green-100 text-green-800" :
                        question.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {question.difficulty === "easy" ? "Dễ" : 
                         question.difficulty === "medium" ? "Trung bình" : "Khó"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(question.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(question.questionId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Trang {page + 1} / {totalPages} ({total} kết quả)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Cập nhật thông tin câu hỏi" : "Tạo một câu hỏi mới cho hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Câu hỏi *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Nhập nội dung câu hỏi"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleAnswer">Đáp án mẫu *</Label>
              <Textarea
                id="sampleAnswer"
                value={formData.sampleAnswer}
                onChange={(e) => setFormData(prev => ({ ...prev, sampleAnswer: e.target.value }))}
                placeholder="Nhập đáp án mẫu"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Độ khó *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.content || !formData.sampleAnswer}
              >
                {editingQuestion ? "Cập nhật" : "Tạo câu hỏi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

