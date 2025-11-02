"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, FileText, Download, Eye, Edit, Trash2, MoreHorizontal, Upload, Filter, Calendar, User, Tag, Pin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { mockDocuments, mockCategories, type Document, type DocumentCategory } from "@/data/mock-documents"
// TODO: Create these components
// import { DocumentUploadModal } from "./document-upload-modal"
// import { DocumentPreviewModal } from "./document-preview-modal"
// import { DocumentCategoryManager } from "./document-category-manager"

export function DocumentClient() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
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
      
      // Sort documents - pinned first, then by selected criteria
      filteredDocs.sort((a, b) => {
        // First sort by pinned status
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        
        // Then sort by selected criteria
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
      
      // Pagination with 5 documents per page
      const startIndex = (currentPage - 1) * 5
      const endIndex = startIndex + 5
      const paginatedDocs = filteredDocs.slice(startIndex, endIndex)
      
      setDocuments(paginatedDocs)
      setTotalDocuments(filteredDocs.length)
      setTotalPages(Math.ceil(filteredDocs.length / 5))
    } catch (error) {
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
      toast.error('Không thể tải xuống tài liệu')
    }
  }

  const handleViewDetail = (document: Document) => {
    router.push(`/documents/${document.documentId}`)
  }

  const handlePreview = () => {
    // TODO: Implement preview functionality
    toast.info('Chức năng xem trước đang được phát triển')
  }

  const handleTogglePin = async (documentId: number) => {
    try {
      // Find the document and toggle its pinned status
      const documentToToggle = mockDocuments.find(doc => doc.documentId === documentId)
      if (documentToToggle) {
        documentToToggle.isPinned = !documentToToggle.isPinned
        const action = documentToToggle.isPinned ? 'ghim' : 'bỏ ghim'
        toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} tài liệu thành công`)
        fetchDocuments()
      }
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái ghim')
    }
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
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
          <p className="text-muted-foreground">
            Quản lý các tài liệu, chính sách và quy trình của công ty. Ghim tài liệu quan trọng để hiển thị ưu tiên.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
        <div className="relative w-full sm:flex-1 sm:max-w-sm min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
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
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px] sticky left-0 bg-background"></TableHead>
                      <TableHead className="w-[300px]">Tên tài liệu</TableHead>
                      <TableHead className="w-[120px]">Danh mục</TableHead>
                      <TableHead className="w-[100px]">Kích thước</TableHead>
                      <TableHead className="w-[80px]">Lượt tải</TableHead>
                      <TableHead className="w-[120px]">Người tải lên</TableHead>
                      <TableHead className="w-[100px]">Ngày tạo</TableHead>
                      <TableHead className="w-[140px]">Tags</TableHead>
                      <TableHead className="w-[70px] sticky right-0 bg-background">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow 
                        key={document.documentId} 
                        className={`align-top ${document.isPinned ? 'bg-orange-50 border-l-4 border-l-orange-400' : ''}`}
                      >
                        <TableCell className={`sticky left-0 align-top py-4 ${document.isPinned ? 'bg-orange-50' : 'bg-background'}`}>
                          <div className="flex items-center justify-center">
                            {document.isPinned && (
                              <Pin className="h-4 w-4 text-orange-500 fill-orange-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[300px] align-top py-4">
                          <div className="space-y-1">
                            <div 
                              className="font-medium text-sm cursor-pointer hover:text-primary line-clamp-2 text-wrap"
                              title={document.title}
                              onClick={() => handleViewDetail(document)}
                            >
                              {document.title}
                            </div>
                            {document.description && (
                              <div 
                                className="text-xs text-muted-foreground line-clamp-2 text-wrap"
                              >
                                {document.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <span>v{document.version}</span>
                              {document.isPublic ? (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">Công khai</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">Riêng tư</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px] align-top py-4">
                          <Badge className={getCategoryColor(document.category.categoryName) + " text-[10px] px-2 py-1"}>
                            <span className="mr-1">{document.category.icon}</span>
                            <span className="truncate">{document.category.categoryName}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[100px] text-sm align-top py-4">
                          <span className="break-words">{formatFileSize(document.fileSize)}</span>
                        </TableCell>
                        <TableCell className="w-[80px] text-sm align-top py-4">
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{document.downloadCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px] text-sm align-top py-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{document.uploadedBy.firstName} {document.uploadedBy.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px] text-sm align-top py-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs break-words">{new Date(document.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[140px] align-top py-4">
                          <div className="flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-[10px] px-1 py-0">
                                <Tag className="h-2 w-2 mr-1" />
                                <span className="truncate max-w-[50px]">{tag}</span>
                              </Badge>
                            ))}
                            {document.tags.length > 2 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                +{document.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`w-[70px] sticky right-0 align-top py-4 ${document.isPinned ? 'bg-orange-50' : 'bg-background'}`}>
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
                              <DropdownMenuItem onClick={() => handleTogglePin(document.documentId)}>
                                <Pin className={`mr-2 h-4 w-4 ${document.isPinned ? 'text-orange-500' : ''}`} />
                                {document.isPinned ? 'Bỏ ghim' : 'Ghim tài liệu'}
                              </DropdownMenuItem>
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
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị {Math.min(5, documents.length)} trong tổng số {totalDocuments} tài liệu
              </div>
              <div className="flex items-center gap-2">
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
