"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, FileText, Calendar, User, Tag, ExternalLink } from "lucide-react"
import { documentAPI, type Document } from "@/lib/api/document"
import { toast } from "sonner"

interface DocumentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  document
}: DocumentPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && document) {
      loadPreview()
    } else {
      setPreviewUrl(null)
    }
  }, [open, document])

  const loadPreview = async () => {
    if (!document) return

    try {
      setLoading(true)
      // For now, we'll just show document info
      // In the future, you could implement actual file preview
      setPreviewUrl('info')
    } catch (error) {
      console.error('Failed to load preview:', error)
      toast.error('Không thể tải xem trước')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!document) return

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
      'policies': 'bg-green-100 text-green-800',
      'regulations': 'bg-red-100 text-red-800',
      'templates': 'bg-purple-100 text-purple-800',
      'training': 'bg-yellow-100 text-yellow-800',
      'procedures': 'bg-indigo-100 text-indigo-800',
    }
    return colors[categoryName.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {getFileIcon(document.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">
                {document.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {document.description || 'Không có mô tả'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="space-y-6">
            {/* Document Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Tên tệp</span>
                  </div>
                  <p className="font-medium">{document.originalFileName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Kích thước</span>
                  </div>
                  <p className="font-medium">{formatFileSize(document.fileSize)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Tải lên bởi</span>
                  </div>
                  <p className="font-medium">
                    {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {document.uploadedBy.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày tải lên</span>
                  </div>
                  <p className="font-medium">
                    {new Date(document.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Category and Version */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Danh mục</span>
                  </div>
                  <Badge className={getCategoryColor(document.category.categoryName)}>
                    {document.category.categoryName}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Phiên bản</span>
                  </div>
                  <p className="font-medium">{document.version}</p>
                </div>
              </div>

              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Thẻ</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Status */}
              {document.approvedBy && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Được phê duyệt bởi</span>
                  </div>
                  <p className="font-medium">
                    {document.approvedBy.firstName} {document.approvedBy.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {document.approvedAt && new Date(document.approvedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Expiration Date */}
              {document.expirationDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày hết hạn</span>
                  </div>
                  <p className="font-medium">
                    {new Date(document.expirationDate).toLocaleDateString('vi-VN')}
                  </p>
                  {new Date(document.expirationDate) < new Date() && (
                    <Badge variant="destructive" className="text-xs">
                      Đã hết hạn
                    </Badge>
                  )}
                </div>
              )}

              {/* Download Count */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span>Lượt tải xuống</span>
                </div>
                <p className="font-medium">{document.downloadCount} lần</p>
              </div>

              {/* Access Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Quyền truy cập</span>
                </div>
                <Badge variant={document.isPublic ? "secondary" : "outline"}>
                  {document.isPublic ? "Công khai" : "Riêng tư"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Preview Area */}
            <div className="space-y-4">
              <h4 className="font-medium">Xem trước tài liệu</h4>
              
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p>Xem trước tệp sẽ được triển khai trong phiên bản tương lai</p>
                    <p className="text-sm">Hiện tại, vui lòng tải xuống tệp để xem nội dung</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Mở trong tab mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
