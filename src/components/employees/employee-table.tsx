"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Employee {
  employeeId: number
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
  positionTypeId: number
  permissions?: number[]
  createdAt: string
}

interface EmployeeTableProps {
  employees: Employee[]
  total: number
  currentPage: number
  pageSize: number
  searchTerm: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  onEdit?: (employee: Employee) => void
  onDelete?: (employeeId: number) => void
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
  onSortChange: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void
  isLoading?: boolean
}

export function EmployeeTable({
  employees,
  total,
  currentPage,
  pageSize,
  searchTerm,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
  onPageChange,
  onSearchChange,
  onSortChange,
  isLoading = false
}: EmployeeTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const totalPages = Math.ceil(total / pageSize)

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order
      const newOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC'
      onSortChange(column, newOrder)
    } else {
      // New column, start with ASC
      onSortChange(column, 'ASC')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortOrder === 'ASC' ?
      <ArrowUp className="ml-2 h-4 w-4" /> :
      <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên nhân viên..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('firstName')}
                  className="h-auto p-0 font-semibold"
                >
                  Nhân viên
                  {getSortIcon('firstName')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('email')}
                  className="h-auto p-0 font-semibold"
                >
                  Email
                  {getSortIcon('email')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('phoneNumber')}
                  className="h-auto p-0 font-semibold"
                >
                  Số điện thoại
                  {getSortIcon('phoneNumber')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('gender')}
                  className="h-auto p-0 font-semibold"
                >
                  Giới tính
                  {getSortIcon('gender')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('startDate')}
                  className="h-auto p-0 font-semibold"
                >
                  Ngày bắt đầu
                  {getSortIcon('startDate')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('baseSalary')}
                  className="h-auto p-0 font-semibold"
                >
                  Lương cơ bản
                  {getSortIcon('baseSalary')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('isActive')}
                  className="h-auto p-0 font-semibold"
                >
                  Trạng thái
                  {getSortIcon('isActive')}
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Không có nhân viên nào
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.employeeId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(employee.firstName, employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {employee.employeeId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phoneNumber}</TableCell>
                <TableCell>
                  <Badge variant={employee.gender ? "default" : "secondary"}>
                    {employee.gender ? "Nam" : "Nữ"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(employee.startDate)}</TableCell>
                <TableCell>{formatCurrency(employee.baseSalary)}</TableCell>
                <TableCell>
                  <Badge variant={employee.isActive ? "default" : "destructive"}>
                    {employee.isActive ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(employee.employeeId)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, total)} đến {Math.min(currentPage * pageSize, total)} trong tổng số {total} nhân viên
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Trước
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className="w-8 h-8 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Sau
        </Button>
      </div>
    </div>
  </div>
  )
}
