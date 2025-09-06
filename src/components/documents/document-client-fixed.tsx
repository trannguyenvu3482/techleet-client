"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCategories, mockDocuments, type Document, type DocumentCategory } from "@/data/mock-documents"
import { Calendar, Download, Edit, Eye, FileText, Filter, MoreHorizontal, Plus, Search, Tag, Trash2, Upload, User } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
// TODO: Create these components
// import { DocumentUploadModal } from "./document-upload-modal"
// import { DocumentPreviewModal } from "./document-preview-modal"
// import { DocumentCategoryManager } from "./document-category-manager"

export function DocumentClient() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<"title" | "createdAt" | "downloadCount">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter documents based on search and category
      let filteredDocs = [...mockDocuments]
      
      if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      if (selectedCategory !== "all") {
        const categoryId = parseInt(selectedCategory)
        filteredDocs = filteredDocs.filter(doc => doc.category.categoryId === categoryId)
      }
      
      // Sort documents
      filteredDocs.sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case "title":
            comparison = a.title.localeCompare(b.title)
            break
          case "createdAt":
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            break
          case "downloadCount":
            comparison = a.downloadCount - b.downloadCount
            break
        }
        return sortOrder === "asc" ? comparison : -comparison
      })
      
      // Simulate pagination
      const startIndex = (currentPage - 1) * 20
      const endIndex = startIndex + 20
      const paginatedDocs = filteredDocs.slice(startIndex, endIndex)
      
      setDocuments(paginatedDocs)
      setTotalPages(Math.ceil(filteredDocs.length / 20))
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Không thể tải danh sách tài liệu')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, currentPage, sortBy, sortOrder])

  const fetchCategories = useCallback(async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      setCategories(mockCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Không thể tải danh mục tài liệu')
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleDownload = async (document: Document) => {
    try {
      // Simulate download
      toast.success(`Tải xuống "${document.title}" thành công`)
    } catch (error) {
      console.error('Failed to download document:', error)
      toast.error('Không thể tải xuống tài liệu')
    }
  }

  const handlePreview = () => {
    // TODO: Implement preview functionality
    toast.info('Chức năng xem trước đang được phát triển')
  }

  const handleDelete = async (documentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return
    }

    try {
      // Simulate delete - remove from local state
      const documentToDelete = mockDocuments.find(doc => doc.documentId === documentId)
      if (documentToDelete) {
        const index = mockDocuments.indexOf(documentToDelete)
        mockDocuments.splice(index, 1)
      }
      
      toast.success('Xóa tài liệu thành công')
      fetchDocuments()
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast.error('Không thể xóa tài liệu')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('video')) return '🎥'
    return '📁'
  }

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      'onboarding': 'bg-blue-100 text-blue-800',
      'chính sách': 'bg-green-100 text-green-800',
      'quy định': 'bg-red-100 text-red-800',
      'mẫu biểu': 'bg-purple-100 text-purple-800',
      'đào tạo': 'bg-yellow-100 text-yellow-800',
      'quy trình': 'bg-indigo-100 text-indigo-800',
      'hợp đồng': 'bg-pink-100 text-pink-800',
      'an toàn': 'bg-orange-100 text-orange-800',
    }
    return colors[categoryName.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải tài liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
          <p className="text-muted-foreground">
            Quản lý các tài liệu, chính sách và quy trình của công ty
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => toast.info('Chức năng quản lý danh mục đang được phát triển')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Quản lý danh mục
          </Button>
          <Button onClick={() => toast.info('Chức năng tải lên đang được phát triển')}>
            <Plus className="mr-2 h-4 w-4" />
            Tải lên tài liệu
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                  {category.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: "title" | "createdAt" | "downloadCount") => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Tên tài liệu</SelectItem>
              <SelectItem value="createdAt">Ngày tạo</SelectItem>
              <SelectItem value="downloadCount">Lượt tải</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Document Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground whitespace-nowrap">
            <TabsTrigger value="all" className="px-3">Tất cả</TabsTrigger>
            <TabsTrigger value="1" className="px-3">Onboarding</TabsTrigger>
            <TabsTrigger value="2" className="px-3">Chính sách</TabsTrigger>
            <TabsTrigger value="3" className="px-3">Quy định</TabsTrigger>
            <TabsTrigger value="4" className="px-3">Mẫu biểu</TabsTrigger>
            <TabsTrigger value="5" className="px-3">Đào tạo</TabsTrigger>
            <TabsTrigger value="6" className="px-3">Quy trình</TabsTrigger>
            <TabsTrigger value="7" className="px-3">Hợp đồng</TabsTrigger>
            <TabsTrigger value="8" className="px-3">An toàn</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Document Table */}
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có tài liệu nào</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Bắt đầu bằng cách tải lên tài liệu đầu tiên của bạn
                </p>
                <Button onClick={() => toast.info('Chức năng tải lên đang được phát triển')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên tài liệu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">Loại</TableHead>
                      <TableHead className="min-w-[250px] max-w-[350px]">Tên tài liệu</TableHead>
                      <TableHead className="w-[120px]">Danh mục</TableHead>
                      <TableHead className="w-[80px]">Kích thước</TableHead>
                      <TableHead className="w-[70px]">Lượt tải</TableHead>
                      <TableHead className="w-[120px]">Người tải lên</TableHead>
                      <TableHead className="w-[100px]">Ngày tạo</TableHead>
                      <TableHead className="w-[150px]">Tags</TableHead>
                      <TableHead className="w-[70px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.documentId}>
                        <TableCell>
                          <div className="text-xl">
                            {getFileIcon(document.mimeType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div 
                              className="font-medium text-sm cursor-pointer hover:text-primary truncate"
                              title={document.title}
                              onClick={() => handlePreview()}
                            >
                              {document.title}
                            </div>
                            {document.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1 truncate">
                                {document.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>v{document.version}</span>
                              {document.isPublic ? (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">Công khai</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">Riêng tư</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(document.category.categoryName) + " text-[10px] px-2 py-1"}>
                            <span className="mr-1">{document.category.icon}</span>
                            <span className="truncate">{document.category.categoryName}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFileSize(document.fileSize)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {document.downloadCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{document.uploadedBy.firstName} {document.uploadedBy.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(document.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-[10px] px-1 py-0">
                                <Tag className="h-2 w-2 mr-1" />
                                <span className="truncate max-w-[60px]">{tag}</span>
                              </Badge>
                            ))}
                            {document.tags.length > 2 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                +{document.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreview()}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem trước
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(document)}>
                                <Download className="mr-2 h-4 w-4" />
                                Tải xuống
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(document.documentId)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Sau
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* TODO: Implement these modals */}
      {/* <DocumentUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSuccess={() => {
          fetchDocuments()
          setShowUploadModal(false)
        }}
        categories={categories}
      />

      <DocumentPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        document={selectedDocument}
      />

      <DocumentCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onSuccess={() => {
          fetchCategories()
          setShowCategoryManager(false)
        }}
      /> */}
    </div>
  )
}
