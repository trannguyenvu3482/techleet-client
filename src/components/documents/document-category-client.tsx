"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Eye, Edit, Trash2, MoreHorizontal, Upload, Grid, List } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { documentAPI, type Document, type DocumentCategory } from "@/lib/api/document"
import { toast } from "sonner"
import { DocumentUploadModal } from "./document-upload-modal"
import { DocumentPreviewModal } from "./document-preview-modal"

interface DocumentCategoryClientProps {
  categoryType: string
  title: string
  description: string
}

export function DocumentCategoryClient({ categoryType, title, description }: DocumentCategoryClientProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryId, setCategoryId] = useState<number | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await documentAPI.getDocumentCategories()
      setCategories(categoriesData)
      
      // Find the category ID for this category type
      const category = categoriesData.find(cat => 
        cat.categoryName.toLowerCase().includes(categoryType.toLowerCase())
      )
      if (category) {
        setCategoryId(category.categoryId)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [categoryType])

  const fetchDocuments = useCallback(async () => {
    if (!categoryId) return
    
    try {
      setLoading(true)
      const response = await documentAPI.getDocuments({
        keyword: searchTerm || undefined,
        categoryId,
        page: currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      })
      setDocuments(response.data)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Không thể tải danh sách tài liệu')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, categoryId, currentPage])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (categoryId) {
      fetchDocuments()
    }
  }, [fetchDocuments, categoryId])

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentAPI.downloadDocument(document.documentId)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = document.originalFileName
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('Tải xuống thành công')
    } catch (error) {
      console.error('Failed to download document:', error)
      toast.error('Không thể tải xuống tài liệu')
    }
  }

  const handlePreview = (document: Document) => {
    setSelectedDocument(document)
    setShowPreviewModal(true)
  }

  const handleDelete = async (documentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return
    }

    try {
      await documentAPI.deleteDocument(documentId)
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

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const DocumentCard = ({ document }: { document: Document }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">
              {getFileIcon(document.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate" title={document.title}>
                {document.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {document.description || 'Không có mô tả'}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(document.fileSize)}
                </span>
                <span className="text-xs text-muted-foreground">
                  v{document.version}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePreview(document)}>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tải lên bởi: {document.uploadedBy.firstName} {document.uploadedBy.lastName}</span>
          <span>{new Date(document.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tải lên tài liệu
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Grid/List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold mb-2">Chưa có tài liệu nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Bắt đầu bằng cách tải lên tài liệu đầu tiên cho danh mục này
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Tải lên tài liệu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
          : "space-y-4"
        }>
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.documentId} document={document} />
          ))}
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

      {/* Modals */}
      <DocumentUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSuccess={() => {
          fetchDocuments()
          setShowUploadModal(false)
        }}
        categories={categories}
        defaultCategoryId={categoryId || undefined}
      />

      <DocumentPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        document={selectedDocument}
      />
    </div>
  )
}
