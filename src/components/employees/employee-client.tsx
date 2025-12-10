"use client";

import * as React from "react";
import { EmployeeTable, Employee } from "@/components/employees/employee-table";
import {
  EmployeeModal,
  EmployeeFormData,
} from "@/components/employees/add-employee-modal";
import { employeeAPI } from "@/lib/api/employees";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function EmployeeClient() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [total, setTotal] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(
    null
  );

  const [creating, setCreating] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  // Sort state
  const [sortBy, setSortBy] = React.useState<string>("");
  const [sortOrder, setSortOrder] = React.useState<"ASC" | "DESC">("ASC");

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEmployees = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1,
        limit: pageSize,
        ...(debouncedSearchTerm && { keyword: debouncedSearchTerm }),
        ...(sortBy && { sortBy, sortOrder }),
      };
      const response = await employeeAPI.getEmployees(params);
      setEmployees(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, sortBy, sortOrder]);

  // Fetch employees when page, search, or sort changes
  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const refreshEmployees = () => {
    fetchEmployees();
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleSubmitEmployee = async (data: EmployeeFormData) => {
    try {
      setCreating(true);
      if (editingEmployee) {
        // Edit existing
        await employeeAPI.updateEmployee(editingEmployee.employeeId, data);
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        // Create new
        await employeeAPI.createEmployee(data);
        toast.success("Tạo nhân viên thành công!");
      }
      setModalOpen(false);
      fetchEmployees(); // Refresh list
    } catch (error) {
      toast.error(
        editingEmployee
          ? "Không thể cập nhật nhân viên"
          : "Không thể tạo nhân viên"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await employeeAPI.deleteEmployee(employeeId);
        toast.success("Đã xóa nhân viên");
        fetchEmployees();
      } catch (error) {
        toast.error("Không thể xóa nhân viên");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (
    newSortBy: string,
    newSortOrder: "ASC" | "DESC"
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sorting
  };

  return (
    <div className="flex flex-1 flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{total} nhân viên</div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={refreshEmployees}
            disabled={loading}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>

          <Button onClick={handleCreateEmployee}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>

          <EmployeeModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={handleSubmitEmployee}
            isLoading={creating}
            employee={editingEmployee}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
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
      </div>
    </div>
  );
}
