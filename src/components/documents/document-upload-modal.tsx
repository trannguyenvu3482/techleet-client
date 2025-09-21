"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Upload, FileText } from "lucide-react"
import { documentAPI, type DocumentCategory, type CreateDocumentRequest } from "@/lib/api/document"
import { toast } from "sonner"

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  categories: DocumentCategory[]
  defaultCategoryId?: number
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  onSuccess,
  categories,
  defaultCategoryId
}: DocumentUploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: defaultCategoryId?.toString() || '',
    isPublic: false,
    expirationDate: '',
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
        setFormData(prev => ({ ...prev, title: nameWithoutExtension }))
      }
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp để tải lên')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu')
      return
    }

    if (!formData.categoryId) {
      toast.error('Vui lòng chọn danh mục')
      return
    }

    try {
      setUploading(true)
      
      const uploadData: CreateDocumentRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        categoryId: parseInt(formData.categoryId),
        tags: tags.length > 0 ? tags : undefined,
        isPublic: formData.isPublic,
        expirationDate: formData.expirationDate || undefined,
        file: selectedFile
      }

      await documentAPI.createDocument(uploadData)
      
      toast.success('Tải lên tài liệu thành công!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: defaultCategoryId?.toString() || '',
        isPublic: false,
        expirationDate: '',
      })
      setTags([])
      setNewTag('')
      setSelectedFile(null)
      
      onSuccess()
    } catch (error) {
      console.error('Failed to upload document:', error)
      toast.error('Không thể tải lên tài liệu. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu mới</DialogTitle>
          <DialogDescription>
            Tải lên tài liệu mới vào hệ thống quản lý tài liệu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Chọn tệp *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Thay đổi
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Kéo thả tệp vào đây hoặc nhấp để chọn
                  </p>
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <Label htmlFor="file" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>Chọn tệp</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tiêu đề tài liệu"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả tài liệu"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Danh mục *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Thẻ</Label>
            <div className="space-y-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Nhập thẻ và nhấn Enter"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Ngày hết hạn</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
            />
          </div>

          {/* Public Access */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic" className="text-sm font-normal">
              Cho phép truy cập công khai
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
