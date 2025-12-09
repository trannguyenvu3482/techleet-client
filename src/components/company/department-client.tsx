"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, Users, Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddDepartmentModal } from "./add-department-modal"
import { EditDepartmentModal } from "./edit-department-modal"
import { companyAPI, type Department, type CreateDepartmentRequest, type UpdateDepartmentRequest } from "@/lib/api/company"
import { toast } from "sonner"

export function DepartmentClient() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await companyAPI.getDepartments({
        keyword: searchTerm || undefined,
        limit: 100, // Get all departments for hierarchy view
      })
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchDepartments()
  }, [searchTerm, fetchDepartments])

  const handleAddDepartment = async (departmentData: CreateDepartmentRequest) => {
    try {
      await companyAPI.createDepartment(departmentData)
      toast.success('Department created successfully')
      setShowAddModal(false)
      fetchDepartments()
    } catch (error) {
      console.error('Failed to create department:', error)
      toast.error('Failed to create department')
    }
  }

  const handleEditDepartment = async (id: number, departmentData: UpdateDepartmentRequest) => {
    try {
      await companyAPI.updateDepartment(id, departmentData)
      toast.success('Department updated successfully')
      setShowEditModal(false)
      setEditingDepartment(null)
      fetchDepartments()
    } catch (error) {
      console.error("Failed to update department:", error)
      toast.error('Failed to update department')
    }
  }

  const openEditModal = (department: Department) => {
    setEditingDepartment(department)
    setShowEditModal(true)
  }

  const handleDeleteDepartment = async (departmentId: number) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return
    }

    try {
      await companyAPI.deleteDepartment(departmentId)
      toast.success('Department deleted successfully')
      fetchDepartments()
    } catch (error) {
      console.error('Failed to delete department:', error)
      toast.error('Failed to delete department')
    }
  }

  const filteredDepartments = departments?.filter(dept =>
    (dept.departmentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (dept.departmentCode?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || []

  // Flatten hierarchy for table view but keep parent indicator if needed
  // For now simple table list is requested to improve UI
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    )
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
            <TableRow>
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No departments found
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => {
                  const parentDept = departments.find(d => d.departmentId === dept.parentDepartmentId);
                  return (
                    <TableRow key={dept.departmentId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                <Building2 className="h-4 w-4" />
                            </div>
                            {dept.departmentName}
                        </div>
                      </TableCell>
                      <TableCell>{dept.departmentCode}</TableCell>
                      <TableCell>
                          {parentDept ? (
                              <Badge variant="outline">{parentDept.departmentName}</Badge>
                          ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                          )}
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{dept.employeeCount || 0}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={dept.isActive ? "default" : "secondary"}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                              onClick={() => handleDeleteDepartment(dept.departmentId)}
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
  )
}
