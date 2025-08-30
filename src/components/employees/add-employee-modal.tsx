"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  birthDate: string
  gender: boolean
  startDate: string
  isActive: boolean
  avatarUrl?: string
  baseSalary: number
  departmentId: number
  positionId: number
  permissions: number[]
}

interface AddEmployeeModalProps {
  onSubmit: (data: EmployeeFormData) => Promise<void>
  isLoading?: boolean
}

export function AddEmployeeModal({ onSubmit, isLoading }: AddEmployeeModalProps) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
    gender: true,
    startDate: "",
    isActive: true,
    avatarUrl: "",
    baseSalary: 0,
    departmentId: 1,
    positionId: 1,
    permissions: [1, 2],
  })

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.firstName.trim()) errors.push("Họ là bắt buộc")
    if (!formData.lastName.trim()) errors.push("Tên là bắt buộc")
    if (!formData.email.trim()) errors.push("Email là bắt buộc")
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Email không hợp lệ")
    }
    if (!formData.phoneNumber.trim()) errors.push("Số điện thoại là bắt buộc")
    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.push("Số điện thoại phải có 10-11 chữ số")
    }
    if (!formData.address.trim()) errors.push("Địa chỉ là bắt buộc")
    if (!formData.birthDate) errors.push("Ngày sinh là bắt buộc")
    if (!formData.startDate) errors.push("Ngày bắt đầu là bắt buộc")
    if (formData.baseSalary <= 0) errors.push("Lương cơ bản phải lớn hơn 0")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }

    try {
      await onSubmit(formData)
      setOpen(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        birthDate: "",
        gender: true,
        startDate: "",
        isActive: true,
        avatarUrl: "",
        baseSalary: 0,
        departmentId: 1,
        positionId: 1,
        permissions: [1, 2],
      })
    } catch (error) {
      console.error("Error creating employee:", error)
    }
  }

  const updateFormData = (field: keyof EmployeeFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để thêm nhân viên mới vào hệ thống
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Họ *</Label>
              <Input
                id="firstName"
                placeholder="Trần"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Tên *</Label>
              <Input
                id="lastName"
                placeholder="Viễn"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="tran.vien@example.com"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                placeholder="093xxxxxxx"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select onValueChange={(value) => updateFormData('gender', value === "true")} value={formData.gender ? "true" : "false"}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Nam</SelectItem>
                  <SelectItem value="false">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Textarea
              id="address"
              placeholder="07 Xô Viết Nghệ Tĩnh, Huyện Hòa Vang, TP. Đà Nẵng"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Ngày sinh *</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData('birthDate', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Ngày bắt đầu *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData('startDate', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseSalary">Lương cơ bản *</Label>
            <Input
              id="baseSalary"
              type="number"
              placeholder="12000000"
              min={0}
              value={formData.baseSalary}
              onChange={(e) => updateFormData('baseSalary', Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL Avatar</Label>
            <Input
              id="avatarUrl"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatarUrl}
              onChange={(e) => updateFormData('avatarUrl', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Phòng ban *</Label>
              <Select onValueChange={(value) => updateFormData('departmentId', Number(value))} value={formData.departmentId.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Phòng Nhân sự</SelectItem>
                  <SelectItem value="2">Phòng Kỹ thuật</SelectItem>
                  <SelectItem value="3">Phòng Kế toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionId">Chức vụ *</Label>
              <Select onValueChange={(value) => updateFormData('positionId', Number(value))} value={formData.positionId.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nhân viên</SelectItem>
                  <SelectItem value="2">Trưởng nhóm</SelectItem>
                  <SelectItem value="3">Quản lý</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo nhân viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
