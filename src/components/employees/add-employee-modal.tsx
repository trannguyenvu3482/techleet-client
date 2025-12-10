"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { companyAPI, Department, Position } from "@/lib/api/company";
import { Employee } from "./employee-table";

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  gender: boolean;
  startDate: string;
  isActive: boolean;
  avatarUrl?: string;
  baseSalary: number;
  departmentId: number;
  positionId: number;
  permissions: number[];
}

interface EmployeeModalProps {
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  employee?: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function EmployeeModal({
  onSubmit,
  employee,
  open,
  onOpenChange,
  isLoading,
}: EmployeeModalProps) {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);

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
    departmentId: 0,
    positionId: 0,
    permissions: [1, 2],
  });

  // Load initial data when editing
  React.useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        address: employee.address,
        birthDate: extractDate(employee.birthDate),
        gender: employee.gender,
        startDate: extractDate(employee.startDate),
        isActive: employee.isActive,
        avatarUrl: employee.avatarUrl || "",
        baseSalary: employee.baseSalary,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        permissions: employee.permissions || [1, 2],
      });
    } else {
      // Reset form when adding new
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
        departmentId: 0,
        positionId: 0,
        permissions: [1, 2],
      });
    }
  }, [employee, open]);

  // Fetch Metadata
  React.useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [deptRes, posRes] = await Promise.all([
            companyAPI.getDepartments({ limit: 100 }),
            companyAPI.getPositions({ limit: 100 }),
          ]);
          setDepartments(deptRes.data);
          setPositions(posRes.data);
        } catch (error) {
          toast.error("Không thể tải dữ liệu phòng ban/chức vụ");
        }
      };
      fetchData();
    }
  }, [open]);

  const extractDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.firstName.trim()) errors.push("Họ là bắt buộc");
    if (!formData.lastName.trim()) errors.push("Tên là bắt buộc");
    if (!formData.email.trim()) errors.push("Email là bắt buộc");
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Email không hợp lệ");
    }
    if (!formData.phoneNumber.trim()) errors.push("Số điện thoại là bắt buộc");
    if (
      formData.phoneNumber &&
      !/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      errors.push("Số điện thoại phải có 10-11 chữ số");
    }
    if (!formData.address.trim()) errors.push("Địa chỉ là bắt buộc");
    if (!formData.birthDate) errors.push("Ngày sinh là bắt buộc");
    if (!formData.startDate) errors.push("Ngày bắt đầu là bắt buộc");
    if (formData.baseSalary <= 0) errors.push("Lương cơ bản phải lớn hơn 0");
    if (!formData.departmentId) errors.push("Vui lòng chọn phòng ban");
    if (!formData.positionId) errors.push("Vui lòng chọn chức vụ");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting employee:", error);
    }
  };

  const updateFormData = (
    field: keyof EmployeeFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Chỉnh sửa thông tin nhân viên"
              : "Điền thông tin để thêm nhân viên mới vào hệ thống"}
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
                onChange={(e) => updateFormData("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Tên *</Label>
              <Input
                id="lastName"
                placeholder="Viễn"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
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
              onChange={(e) => updateFormData("email", e.target.value)}
              required
              disabled={!!employee} // Disable email edit for existing employee
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                placeholder="093xxxxxxx"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("gender", value === "true")
                }
                value={formData.gender ? "true" : "false"}
              >
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
              onChange={(e) => updateFormData("address", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Ngày sinh *</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData("birthDate", e.target.value)}
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
              onChange={(e) => updateFormData("startDate", e.target.value)}
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
              onChange={(e) =>
                updateFormData("baseSalary", Number(e.target.value))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL Avatar</Label>
            <Input
              id="avatarUrl"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatarUrl}
              onChange={(e) => updateFormData("avatarUrl", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Phòng ban *</Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("departmentId", Number(value))
                }
                value={
                  formData.departmentId ? formData.departmentId.toString() : ""
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept.departmentId}
                      value={dept.departmentId.toString()}
                    >
                      {dept.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionId">Chức vụ *</Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("positionId", Number(value))
                }
                value={
                  formData.positionId ? formData.positionId.toString() : ""
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem
                      key={pos.positionId}
                      value={pos.positionId.toString()}
                    >
                      {pos.positionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Trạng thái</Label>
            <Select
              onValueChange={(value) =>
                updateFormData("isActive", value === "true")
              }
              value={formData.isActive ? "true" : "false"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : employee
                ? "Cập nhật"
                : "Tạo nhân viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
