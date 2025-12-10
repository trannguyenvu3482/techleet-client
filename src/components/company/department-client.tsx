"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Building2,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddDepartmentModal } from "./add-department-modal";
import { EditDepartmentModal } from "./edit-department-modal";
import {
  companyAPI,
  type Department,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
} from "@/lib/api/company";
import { employeeAPI } from "@/lib/api/employees";
import { toast } from "sonner";
import { Employee } from "@/components/employees/employee-table";

export function DepartmentClient() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptResponse, empResponse] = await Promise.all([
        companyAPI.getDepartments({
          keyword: searchTerm || undefined,
          limit: 100,
        }),
        employeeAPI.getEmployees({ limit: 1000 }),
      ]);

      setDepartments(deptResponse.data);
      setEmployees(empResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddDepartment = async (
    departmentData: CreateDepartmentRequest
  ) => {
    try {
      await companyAPI.createDepartment(departmentData);
      toast.success("Department created successfully");
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create department:", error);
      toast.error("Failed to create department");
    }
  };

  const handleEditDepartment = async (
    id: number,
    departmentData: UpdateDepartmentRequest
  ) => {
    try {
      await companyAPI.updateDepartment(id, departmentData);
      toast.success("Department updated successfully");
      setShowEditModal(false);
      setEditingDepartment(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update department:", error);
      toast.error("Failed to update department");
    }
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    setShowEditModal(true);
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      await companyAPI.deleteDepartment(departmentId);
      toast.success("Department deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete department:", error);
      toast.error("Failed to delete department");
    }
  };

  const filteredDepartments = useMemo(() => {
    return (
      departments?.filter(
        (dept) =>
          (dept.departmentName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (dept.departmentCode?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
      ) || []
    );
  }, [departments, searchTerm]);

  const getDepartmentStats = (deptId: number) => {
    const count = employees.filter((e) => e.departmentId === deptId).length;
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s department structure
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Department List - Table View */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Department Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Parent Department</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => {
                const parentDept = departments.find(
                  (d) => d.departmentId === dept.parentDepartmentId
                );
                const employeeCount = getDepartmentStats(dept.departmentId);

                return (
                  <TableRow
                    key={dept.departmentId}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {dept.departmentName}
                          </div>
                          {dept.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {dept.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {dept.departmentCode || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {parentDept ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                          <span className="text-sm font-medium">
                            {parentDept.departmentName}
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none"
                        >
                          Root
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{employeeCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          dept.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(dept)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDeleteDepartment(dept.departmentId)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddDepartment}
        departments={departments}
      />

      {/* Edit Department Modal */}
      <EditDepartmentModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSubmit={handleEditDepartment}
        department={editingDepartment}
        departments={departments}
      />
    </div>
  );
}
