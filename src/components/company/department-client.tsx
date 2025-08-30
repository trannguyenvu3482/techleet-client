"use client"

import { useState, useEffect } from "react"
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
import { AddDepartmentModal } from "./add-department-modal"
import { companyAPI, type Department } from "@/lib/api/company"
import { toast } from "sonner"

export function DepartmentClient() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchDepartments = async () => {
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
  }

  useEffect(() => {
    fetchDepartments()
  }, [searchTerm])

  const handleAddDepartment = async (departmentData: any) => {
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
    dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Group departments by parent (simple hierarchy)
  const rootDepartments = filteredDepartments?.filter(dept => !dept.parentDepartmentId) || []
  const childDepartments = filteredDepartments?.filter(dept => dept.parentDepartmentId) || []

  const getDepartmentChildren = (parentId: number) => {
    return childDepartments?.filter(dept => dept.parentDepartmentId === parentId) || []
  }

  const DepartmentCard = ({ department, isChild = false }: { department: Department; isChild?: boolean }) => (
    <Card className={`${isChild ? 'ml-6 border-l-4 border-l-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{department.departmentName}</CardTitle>
              <CardDescription>Code: {department.departmentCode}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={department.isActive ? "default" : "secondary"}>
              {department.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeleteDepartment(department.departmentId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Description</p>
            <p className="font-medium">{department.description || "No description"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Employee Count</p>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{department.employeeCount || 0}</span>
            </div>
          </div>
        </div>
        {department.manager && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">Manager</p>
            <p className="font-medium">{department.manager.firstName} {department.manager.lastName}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

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
            Manage your organization's department structure and hierarchy
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

      {/* Department List */}
      <div className="space-y-4">
        {rootDepartments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No departments found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first department
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </CardContent>
          </Card>
        ) : (
          rootDepartments.map((department) => (
            <div key={department.departmentId} className="space-y-2">
              <DepartmentCard department={department} />
              {/* Child departments */}
              {getDepartmentChildren(department.departmentId).map((childDept) => (
                <DepartmentCard 
                  key={childDept.departmentId} 
                  department={childDept} 
                  isChild={true} 
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddDepartment}
        departments={departments}
      />
    </div>
  )
}
