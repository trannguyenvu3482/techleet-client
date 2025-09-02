"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock organizational data - this would come from your API
interface OrgNode {
  id: number
  name: string
  position: string
  department: string
  email: string
  avatarUrl?: string
  employees?: OrgNode[]
  isExpanded?: boolean
}

const mockOrgData: OrgNode = {
  id: 1,
  name: "Nguyễn Văn An",
  position: "Giám đốc điều hành",
  department: "Ban lãnh đạo",
  email: "an.nguyen@techleet.com",
  isExpanded: true,
  employees: [
    {
      id: 2,
      name: "Trần Thị Bình",
      position: "Giám đốc Kỹ thuật",
      department: "Phòng Kỹ thuật",
      email: "binh.tran@techleet.com",
      isExpanded: true,
      employees: [
        {
          id: 3,
          name: "Lê Văn Cường",
          position: "Team Lead Frontend",
          department: "Phòng Kỹ thuật",
          email: "cuong.le@techleet.com",
          employees: [
            {
              id: 4,
              name: "Phạm Văn Đức",
              position: "Senior Frontend Developer",
              department: "Phòng Kỹ thuật",
              email: "duc.pham@techleet.com"
            },
            {
              id: 5,
              name: "Hoàng Thị Mai",
              position: "Frontend Developer",
              department: "Phòng Kỹ thuật",
              email: "mai.hoang@techleet.com"
            }
          ]
        },
        {
          id: 6,
          name: "Vũ Minh Tuấn",
          position: "Team Lead Backend",
          department: "Phòng Kỹ thuật",
          email: "tuan.vu@techleet.com",
          employees: [
            {
              id: 7,
              name: "Đặng Văn Hùng",
              position: "Senior Backend Developer",
              department: "Phòng Kỹ thuật",
              email: "hung.dang@techleet.com"
            }
          ]
        }
      ]
    },
    {
      id: 8,
      name: "Bùi Thị Lan",
      position: "Giám đốc Nhân sự",
      department: "Phòng Nhân sự",
      email: "lan.bui@techleet.com",
      employees: [
        {
          id: 9,
          name: "Lương Văn Nam",
          position: "HR Specialist",
          department: "Phòng Nhân sự",
          email: "nam.luong@techleet.com"
        },
        {
          id: 10,
          name: "Ngô Thị Hương",
          position: "Recruiter",
          department: "Phòng Nhân sự",
          email: "huong.ngo@techleet.com"
        }
      ]
    },
    {
      id: 11,
      name: "Đỗ Văn Minh",
      position: "Giám đốc Tài chính",
      department: "Phòng Tài chính",
      email: "minh.do@techleet.com",
      employees: [
        {
          id: 12,
          name: "Cao Thị Phương",
          position: "Kế toán trưởng",
          department: "Phòng Tài chính",
          email: "phuong.cao@techleet.com"
        }
      ]
    }
  ]
}

export function OrganizationalChart() {
  const [orgData, setOrgData] = React.useState<OrgNode>(mockOrgData)

  const toggleExpanded = (nodeId: number, currentNode: OrgNode): OrgNode => {
    if (currentNode.id === nodeId) {
      return { ...currentNode, isExpanded: !currentNode.isExpanded }
    }
    
    if (currentNode.employees) {
      return {
        ...currentNode,
        employees: currentNode.employees.map(emp => toggleExpanded(nodeId, emp))
      }
    }
    
    return currentNode
  }

  const handleToggle = (nodeId: number) => {
    setOrgData(prev => toggleExpanded(nodeId, prev))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
  }

  const countTotalEmployees = (node: OrgNode): number => {
    let count = 1 // Current node
    if (node.employees) {
      count += node.employees.reduce((sum, emp) => sum + countTotalEmployees(emp), 0)
    }
    return count
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cơ cấu tổ chức</h2>
          <p className="text-muted-foreground">
            Sơ đồ tổ chức và cấu trúc quản lý của công ty ({countTotalEmployees(orgData)} nhân viên)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Xuất sơ đồ
          </Button>
        </div>
      </div>

      {/* Organizational Tree */}
      <div className="space-y-4">
        <OrgNode 
          node={orgData} 
          level={0} 
          onToggle={handleToggle}
          getInitials={getInitials}
        />
      </div>
    </div>
  )
}

interface OrgNodeProps {
  node: OrgNode
  level: number
  onToggle: (nodeId: number) => void
  getInitials: (name: string) => string
}

function OrgNode({ node, level, onToggle, getInitials }: OrgNodeProps) {
  const hasChildren = node.employees && node.employees.length > 0
  const isExpanded = node.isExpanded || false

  return (
    <div className="space-y-2">
      <Card className={`transition-all duration-200 ${level === 0 ? 'border-primary shadow-lg' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(node.id)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={node.avatarUrl} />
              <AvatarFallback>{getInitials(node.name)}</AvatarFallback>
            </Avatar>

            {/* Employee Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{node.name}</h3>
                {level === 0 && (
                  <Badge variant="default" className="bg-primary">
                    CEO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{node.position}</p>
              <p className="text-xs text-muted-foreground">{node.department}</p>
            </div>

            {/* Employee Count */}
            {hasChildren && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{node.employees!.length}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={`ml-${level * 6 + 6} space-y-2 border-l-2 border-muted pl-4`}>
          {node.employees!.map((employee) => (
            <OrgNode
              key={employee.id}
              node={employee}
              level={level + 1}
              onToggle={onToggle}
              getInitials={getInitials}
            />
          ))}
        </div>
      )}
    </div>
  )
}
