"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Briefcase, Users, Edit, Trash2, MoreHorizontal, DollarSign } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddPositionModal } from "@/components/company/add-position-modal"
import { EditPositionModal } from "@/components/company/edit-position-modal"
import { companyAPI, type Position, type Department, type CreatePositionRequest, type UpdatePositionRequest } from "@/lib/api/company"
import { toast } from "sonner"

export function PositionClient() {
  const [allPositions, setAllPositions] = useState<Position[]>([]) // Store all positions for frontend filter
  const [positions, setPositions] = useState<Position[]>([]) // Displayed positions
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)

  // Fetch all positions once (limit 100 or higher) to enable frontend search
  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await companyAPI.getPositions({
        limit: 100,
        // We fetch ALL and filter locally to avoid API search issues mentioned in ticket
      })
      setAllPositions(response.data)
      setPositions(response.data) 
    } catch (error) {
      console.error('Failed to fetch positions:', error)
      toast.error('Failed to load positions')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await companyAPI.getDepartments({ limit: 100, isActive: true })
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchPositions()
  }, [fetchPositions])

  // Frontend Filtering
  useEffect(() => {
     let filtered = allPositions;

     if (searchTerm) {
         const lowerTerm = searchTerm.toLowerCase();
         filtered = filtered.filter(p => 
             (p.positionName?.toLowerCase() || "").includes(lowerTerm) ||
             (p.positionCode?.toLowerCase() || "").includes(lowerTerm)
         );
     }

     if (selectedDepartment && selectedDepartment !== "all") {
         filtered = filtered.filter(p => p.departmentId === parseInt(selectedDepartment));
     }

     if (selectedLevel && selectedLevel !== "all") {
         filtered = filtered.filter(p => p.level === selectedLevel);
     }

     setPositions(filtered);
  }, [searchTerm, selectedDepartment, selectedLevel, allPositions]);


  const handleAddPosition = async (positionData: CreatePositionRequest) => {
    try {
      await companyAPI.createPosition(positionData)
      toast.success('Position created successfully')
      setShowAddModal(false)
      fetchPositions()
    } catch (error) {
      console.error('Failed to create position:', error)
      toast.error('Failed to create position')
    }
  }

  const handleEditPosition = async (id: number, positionData: UpdatePositionRequest) => {
      try {
        await companyAPI.updatePosition(id, positionData)
        toast.success('Position updated successfully')
        setShowEditModal(false)
        setEditingPosition(null)
        fetchPositions()
      } catch (error) {
        console.error("Failed to update position:", error)
        toast.error("Failed to update position")
      }
  }

  const openEditModal = (position: Position) => {
      setEditingPosition(position)
      setShowEditModal(true)
  }

  const handleDeletePosition = async (positionId: number) => {
    if (!confirm('Are you sure you want to delete this position?')) {
      return
    }

    try {
      await companyAPI.deletePosition(positionId)
      toast.success('Position deleted successfully')
      fetchPositions()
    } catch (error) {
      console.error('Failed to delete position:', error)
      toast.error('Failed to delete position')
    }
  }

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getLevelColor = (level: string | number | undefined) => {
    if (!level) return 'bg-gray-100 text-gray-800'

    const levelStr = String(level).toLowerCase()
    switch (levelStr) {
      case 'intern': case '1': return 'bg-gray-100 text-gray-800'
      case 'junior': case '2': return 'bg-blue-100 text-blue-800'
      case 'mid': case 'middle': case '3': return 'bg-green-100 text-green-800'
      case 'senior': case '4': return 'bg-orange-100 text-orange-800'
      case 'lead': case 'principal': case '5': return 'bg-purple-100 text-purple-800'
      case 'manager': case 'director': case '6': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const PositionCard = ({ position }: { position: Position }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Briefcase className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{position.positionName}</CardTitle>
              <CardDescription>Code: {position.positionCode}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getLevelColor(position.level)}>
              {position.level}
            </Badge>
            <Badge variant={position.isActive ? "default" : "secondary"}>
              {position.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditModal(position)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeletePosition(position.positionId)}
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
            <p className="text-muted-foreground">Department</p>
            <p className="font-medium">{position.department?.departmentName || "No department"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Employee Count</p>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{position.employeeCount || 0}</span>
            </div>
          </div>
        </div>
        
        {(position.minSalary || position.maxSalary) && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">Salary Range</p>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">
                {position.minSalary && position.maxSalary 
                  ? `${formatSalary(position.minSalary)} - ${formatSalary(position.maxSalary)}`
                  : position.minSalary 
                    ? `From ${formatSalary(position.minSalary)}`
                    : `Up to ${formatSalary(position.maxSalary!)}`
                }
              </span>
            </div>
          </div>
        )}

        {position.description && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{position.description}</p>
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
          <p className="mt-2 text-muted-foreground">Loading positions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Position Management</h1>
          <p className="text-muted-foreground">
            Manage job positions and salary ranges
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search positions (local)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.departmentId} value={dept.departmentId.toString()}>
                {dept.departmentName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="Intern">Intern</SelectItem>
            <SelectItem value="Junior">Junior</SelectItem>
            <SelectItem value="Mid">Mid</SelectItem>
            <SelectItem value="Senior">Senior</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Position List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {positions.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No positions found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {allPositions.length === 0 
                     ? "Get started by creating your first position" 
                     : "No positions match your search filters"}
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          positions.map((position) => (
            <PositionCard key={position.positionId} position={position} />
          ))
        )}
      </div>

      {/* Add Position Modal */}
      <AddPositionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddPosition}
        departments={departments}
      />

       {/* Edit Position Modal */}
       <EditPositionModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSubmit={handleEditPosition}
        position={editingPosition}
        departments={departments}
      />
    </div>
  )
}
