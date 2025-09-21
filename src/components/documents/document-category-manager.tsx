"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { documentAPI, type CreateDocumentCategoryRequest, type DocumentCategory } from "@/lib/api/document"
import { Plus, Save, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface DocumentCategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DocumentCategoryManager({
  open,
  onOpenChange,
  onSuccess
}: DocumentCategoryManagerProps) {
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    color: '#3b82f6',
    icon: '📁'
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await documentAPI.getDocumentCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Không thể tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!formData.categoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      const categoryData: CreateDocumentCategoryRequest = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon,
        isActive: true
      }

      await documentAPI.createDocumentCategory(categoryData)
      toast.success('Tạo danh mục thành công')
      
      setFormData({
        categoryName: '',
        description: '',
        color: '#3b82f6',
        icon: '📁'
      })
      setShowAddForm(false)
      fetchCategories()
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error('Không thể tạo danh mục')
    }
  }



  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả tài liệu trong danh mục sẽ bị ảnh hưởng.')) {
      return
    }

    try {
      await documentAPI.deleteDocumentCategory(categoryId)
      toast.success('Xóa danh mục thành công')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Không thể xóa danh mục')
    }
  }

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]

  const predefinedIcons = [
    '📁', '📄', '📝', '📊', '🏢', '👥', '⚖️', '📋', '🎯', '📚'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý danh mục tài liệu</DialogTitle>
          <DialogDescription>
            Tạo và quản lý các danh mục để phân loại tài liệu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Category Form */}
          {showAddForm ? (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Thêm danh mục mới</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Tên danh mục *</Label>
                  <Input
                    id="categoryName"
                    value={formData.categoryName}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Biểu tượng</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-16 text-center"
                    />
                    <div className="flex gap-1">
                      {predefinedIcons.slice(0, 5).map((icon) => (
                        <Button
                          key={icon}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        >
                          {icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả danh mục"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="flex gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({
                      categoryName: '',
                      description: '',
                      color: '#3b82f6',
                      icon: '📁'
                    })
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Hủy
                </Button>
                <Button onClick={handleCreateCategory}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm danh mục
              </Button>
            </div>
          )}

          {/* Categories Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số tài liệu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Chưa có danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.categoryId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <div className="font-medium">{category.categoryName}</div>
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {category.description || 'Không có mô tả'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category.documentCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.categoryId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onSuccess}>
            Hoàn thành
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
