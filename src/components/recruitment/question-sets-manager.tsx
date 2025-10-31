"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Eye, FolderPlus } from "lucide-react"
import { questionAPI, QuestionSet, Question, CreateQuestionSetRequest, UpdateQuestionSetRequest } from "@/lib/api/recruitment"

export function QuestionSetsManager() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false)
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null)
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null)
  const [page, setPage] = useState(0)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchText, setSearchText] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  })
  
  // States for add question dialog
  const [questionFilterPage, setQuestionFilterPage] = useState(0)
  const [questionFilterText, setQuestionFilterText] = useState("")
  const [questionFilterDifficulty, setQuestionFilterDifficulty] = useState<string>("")
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [filteredQuestionsTotal, setFilteredQuestionsTotal] = useState(0)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])
  // Client-side paging after excluding questions already in the set
  const [questionClientPage, setQuestionClientPage] = useState(0)
  const questionPageSize = 10
  const [questionClientTotal, setQuestionClientTotal] = useState(0)
  const [questionPageItems, setQuestionPageItems] = useState<Question[]>([])

  useEffect(() => {
    fetchData()
  }, [page, searchText])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [setsResp, qsResp] = await Promise.all([
        questionAPI.getQuestionSets({ page, limit, text: searchText }),
        questionAPI.getQuestions({ limit: 100 })
      ])
      setQuestionSets(setsResp.data)
      setTotal(setsResp.total)
      setQuestions(qsResp.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const handleOpenDialog = (set?: QuestionSet) => {
    if (set) {
      setEditingSet(set)
      setFormData({
        title: set.title,
        description: set.description || ""
      })
    } else {
      setEditingSet(null)
      setFormData({ title: "", description: "" })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingSet(null)
    setFormData({ title: "", description: "" })
  }

  const handleShowDetail = (set: QuestionSet) => {
    setSelectedSet(set)
    setShowDetailDialog(true)
  }

  const handleOpenAddQuestionDialog = async (set: QuestionSet) => {
    setSelectedSet(set)
    setShowAddQuestionDialog(true)
    setQuestionFilterPage(0)
    setQuestionFilterText("")
    setQuestionFilterDifficulty("")
    setSelectedQuestionIds([])
    await fetchFilteredQuestions()
  }

  const fetchFilteredQuestions = async () => {
    try {
      setLoadingQuestions(true)
      // Fetch a larger batch then paginate on the client after exclusion
      const response = await questionAPI.getQuestions({
        page: 0,
        limit: 100,
        text: questionFilterText,
        difficulty: questionFilterDifficulty || undefined
      })
      setFilteredQuestions(response.data)
      setFilteredQuestionsTotal(response.total)
      // Compute available list after excluding existing questions in the set
      const existingIds = selectedSet?.questionSetItems?.map(i => i.question.questionId) || []
      const availableAll = response.data.filter(q => !existingIds.includes(q.questionId))
      setQuestionClientTotal(availableAll.length)
      const start = questionClientPage * questionPageSize
      setQuestionPageItems(availableAll.slice(start, start + questionPageSize))
    } catch (error) {
      console.error("Error fetching filtered questions:", error)
    } finally {
      setLoadingQuestions(false)
    }
  }

  useEffect(() => {
    if (showAddQuestionDialog) {
      fetchFilteredQuestions()
    }
  }, [questionFilterText, questionFilterDifficulty, showAddQuestionDialog])

  // Recompute page items when page changes or selected set changes
  useEffect(() => {
    const existingIds = selectedSet?.questionSetItems?.map(i => i.question.questionId) || []
    const availableAll = filteredQuestions.filter(q => !existingIds.includes(q.questionId))
    setQuestionClientTotal(availableAll.length)
    const start = questionClientPage * questionPageSize
    setQuestionPageItems(availableAll.slice(start, start + questionPageSize))
  }, [questionClientPage, selectedSet, filteredQuestions])

  const questionTotalPages = Math.ceil(filteredQuestionsTotal / 10)

  const handleSubmit = async () => {
    try {
      if (editingSet) {
        const updateData: UpdateQuestionSetRequest = {
          title: formData.title,
          description: formData.description
        }
        await questionAPI.updateQuestionSet(editingSet.setId, updateData)
      } else {
        const createData: CreateQuestionSetRequest = {
          title: formData.title,
          description: formData.description
        }
        await questionAPI.createQuestionSet(createData)
      }
      await fetchData()
      handleCloseDialog()
    } catch (error) {
      console.error("Error saving question set:", error)
    }
  }

  const handleDelete = async (setId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bộ câu hỏi này? Tất cả các câu hỏi trong bộ sẽ bị xóa.")) return
    try {
      await questionAPI.deleteQuestionSet(setId)
      await fetchData()
    } catch (error) {
      console.error("Error deleting question set:", error)
    }
  }

  const handleAddQuestion = async (questionId: number) => {
    if (!selectedSet) return
    try {
      await questionAPI.addQuestionToSet(selectedSet.setId, questionId)
      await fetchData()
      
      // Refresh the selected set data to show the new question
      const updated = await questionAPI.getQuestionSets({ text: selectedSet.title })
      const updatedSet = updated.data.find(s => s.setId === selectedSet.setId)
      if (updatedSet) setSelectedSet(updatedSet)
      
      setShowAddQuestionDialog(false)
    } catch (error) {
      console.error("Error adding question to set:", error)
      alert(error instanceof Error ? error.message : "Không thể thêm câu hỏi vào bộ")
    }
  }

  const handleAddMultipleQuestions = async () => {
    if (!selectedSet || selectedQuestionIds.length === 0) return
    
    try {
      // Add all selected questions
      for (const questionId of selectedQuestionIds) {
        await questionAPI.addQuestionToSet(selectedSet.setId, questionId)
      }
      await fetchData()
      
      // Refresh the selected set data
      const updated = await questionAPI.getQuestionSets({ text: selectedSet.title })
      const updatedSet = updated.data.find(s => s.setId === selectedSet.setId)
      if (updatedSet) setSelectedSet(updatedSet)
      
      setSelectedQuestionIds([])
      setShowAddQuestionDialog(false)
      alert(`Đã thêm ${selectedQuestionIds.length} câu hỏi vào bộ!`)
    } catch (error) {
      console.error("Error adding multiple questions to set:", error)
      alert(error instanceof Error ? error.message : "Không thể thêm câu hỏi vào bộ")
    }
  }

  const handleToggleQuestionSelect = (questionId: number) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleRemoveQuestion = async (itemId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi khỏi bộ?")) return
    try {
      await questionAPI.removeQuestionFromSet(itemId)
      await fetchData()
      if (selectedSet) {
        const updated = await questionAPI.getQuestionSets({ text: selectedSet.title })
        const updatedSet = updated.data.find(s => s.setId === selectedSet.setId)
        if (updatedSet) setSelectedSet(updatedSet)
      }
    } catch (error) {
      console.error("Error removing question from set:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý bộ câu hỏi</h1>
          <p className="text-muted-foreground">Tạo và quản lý các bộ câu hỏi tuyển dụng</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo bộ câu hỏi mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Từ khóa</Label>
              <Input
                className="w-full"
                placeholder="Nhập từ khóa..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bộ câu hỏi</CardTitle>
          <CardDescription>{total} bộ câu hỏi trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-96 animate-spin" />
            </div>
          ) : questionSets.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Chưa có bộ câu hỏi nào. Hãy tạo bộ câu hỏi mới.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bộ câu hỏi</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số lượng câu hỏi</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionSets.map((set) => (
                  <TableRow key={set.setId}>
                    <TableCell className="font-medium">{set.title}</TableCell>
                    <TableCell className="max-w-md truncate">{set.description || "Không có mô tả"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{set.questionSetItems?.length || 0} câu hỏi</Badge>
                    </TableCell>
                    <TableCell>{new Date(set.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleShowDetail(set)}>
                          <FolderPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(set)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(set.setId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">Trang {page + 1} / {totalPages} ({total} kết quả)</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Trước</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>Sau</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="!w-[900px] max-w-none">
          <DialogHeader>
            <DialogTitle>{editingSet ? "Chỉnh sửa bộ câu hỏi" : "Tạo bộ câu hỏi mới"}</DialogTitle>
            <DialogDescription>{editingSet ? "Cập nhật thông tin bộ câu hỏi" : "Tạo một bộ câu hỏi mới cho hệ thống"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setTitle">Tên bộ câu hỏi *</Label>
              <Input id="setTitle" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Nhập tên bộ câu hỏi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setDescription">Mô tả</Label>
              <Textarea id="setDescription" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Nhập mô tả bộ câu hỏi" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={!formData.title}>{editingSet ? "Cập nhật" : "Tạo bộ câu hỏi"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!w-[900px] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedSet?.title}</DialogTitle>
            <DialogDescription>{selectedSet?.description || "Chi tiết bộ câu hỏi"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4  overflow-y-auto flex-1 min-h-0">
            <div className="flex justify-end">
              <Button onClick={() => selectedSet && handleOpenAddQuestionDialog(selectedSet)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </div>
            {selectedSet?.questionSetItems && selectedSet.questionSetItems.length > 0 ? (
              <div className="space-y-2">
                {selectedSet.questionSetItems.map((item) => (
                  <Card key={item.setItemId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.question.content}</p>
                          <Badge
                            variant={item.question.difficulty === "easy" ? "default" : item.question.difficulty === "medium" ? "secondary" : "destructive"}
                            className="mt-2"
                          >
                            {item.question.difficulty === "easy" ? "Dễ" : item.question.difficulty === "medium" ? "Trung bình" : "Khó"}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(item.setItemId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Chưa có câu hỏi nào trong bộ câu hỏi này.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
        <DialogContent className="!w-[900px] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Thêm câu hỏi vào bộ</DialogTitle>
            <DialogDescription>
              Chọn nhiều câu hỏi để thêm vào bộ câu hỏi {selectedQuestionIds.length > 0 && `(${selectedQuestionIds.length} đã chọn)`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1">
            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Tìm kiếm</Label>
                <Input
                  className="w-full"
                  placeholder="Nhập từ khóa tìm kiếm..."
                  value={questionFilterText}
                  onChange={(e) => { setQuestionFilterText(e.target.value); setQuestionFilterPage(0); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select value={questionFilterDifficulty || "all"} onValueChange={(val) => { setQuestionFilterDifficulty(val === "all" ? "" : val); setQuestionFilterPage(0); }}>
                  <SelectTrigger className="w-full">
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
            </div>

            {/* Questions Table */}
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Không tìm thấy câu hỏi nào.</div>
            ) : (
              questionClientTotal === 0 ? (
                <div className="py-8 text-center text-muted-foreground">Tất cả câu hỏi đã được thêm vào bộ này.</div>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={questionPageItems.length > 0 && selectedQuestionIds.length === questionPageItems.length}
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  setSelectedQuestionIds(questionPageItems.map(q => q.questionId))
                                } else {
                                  setSelectedQuestionIds([])
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="w-[50%]">Câu hỏi</TableHead>
                          <TableHead>Độ khó</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questionPageItems.map((question) => (
                          <TableRow key={question.questionId}>
                            <TableCell>
                              <Checkbox
                                checked={selectedQuestionIds.includes(question.questionId)}
                                onCheckedChange={() => handleToggleQuestionSelect(question.questionId)}
                              />
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="break-words">{question.content}</p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}
                              >
                                {question.difficulty === "easy" ? "Dễ" : question.difficulty === "medium" ? "Trung bình" : "Khó"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddQuestion(question.questionId)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {Math.ceil(questionClientTotal / questionPageSize) > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Trang {questionClientPage + 1} / {Math.ceil(questionClientTotal / questionPageSize)} ({questionClientTotal} kết quả)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuestionClientPage(Math.max(0, questionClientPage - 1))}
                          disabled={questionClientPage === 0}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuestionClientPage(Math.min(Math.ceil(questionClientTotal / questionPageSize) - 1, questionClientPage + 1))}
                          disabled={questionClientPage >= Math.ceil(questionClientTotal / questionPageSize) - 1}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
          
          {/* Footer with Add Multiple Button */}
          {selectedQuestionIds.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Đã chọn {selectedQuestionIds.length} câu hỏi
                </div>
                <Button
                  onClick={handleAddMultipleQuestions}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm {selectedQuestionIds.length} câu hỏi đã chọn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
