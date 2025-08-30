"use client"

import * as React from "react"
import { EmployeeTable, Employee } from "@/components/employees/employee-table"
import { AddEmployeeModal, EmployeeFormData } from "@/components/employees/add-employee-modal"
import { employeeAPI } from "@/lib/api/employees"
import { toast } from "sonner"

export function EmployeeClient() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [total, setTotal] = React.useState(0)
  const [creating, setCreating] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")

  // Sort state
  const [sortBy, setSortBy] = React.useState<string>("")
  const [sortOrder, setSortOrder] = React.useState<'ASC' | 'DESC'>('ASC')

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchEmployees = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage - 1, // API expects 0-based page
        limit: pageSize,
        ...(debouncedSearchTerm && { keyword: debouncedSearchTerm }),
        ...(sortBy && { sortBy, sortOrder })
      }
      const response = await employeeAPI.getEmployees(params)
      setEmployees(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Không thể tải danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearchTerm, sortBy, sortOrder])

  // Fetch employees when page, search, or sort changes
  React.useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const refreshEmployees = () => {
    fetchEmployees()
  }

  const handleCreateEmployee = async (data: EmployeeFormData) => {
    try {
      setCreating(true)
      const newEmployee = await employeeAPI.createEmployee(data)
      setEmployees(prev => [newEmployee, ...prev])
      setTotal(prev => prev + 1)
      toast.success('Tạo nhân viên thành công!')
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error('Không thể tạo nhân viên')
      throw error
    } finally {
      setCreating(false)
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    // TODO: Implement edit functionality
    console.log('Edit employee:', employee)
    toast.info('Chức năng chỉnh sửa sẽ được triển khai sau')
  }

  const handleDeleteEmployee = (employeeId: number) => {
    // TODO: Implement delete functionality
    console.log('Delete employee:', employeeId)
    toast.info('Chức năng xóa sẽ được triển khai sau')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1) // Reset to first page when sorting
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh sách nhân viên</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin nhân viên trong công ty ({total} nhân viên)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshEmployees}
            disabled={loading}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
          <AddEmployeeModal onSubmit={handleCreateEmployee} isLoading={creating} />
        </div>
      </div>
      
      <div className="flex-1">
        {employees.length === 0 ? (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Không có nhân viên nào</p>
              <AddEmployeeModal onSubmit={handleCreateEmployee} isLoading={creating} />
            </div>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  )
}
