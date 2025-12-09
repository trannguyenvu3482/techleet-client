"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock organizational data
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
  const [zoom, setZoom] = React.useState(1)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))

  return (
    <div className="h-[800px] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cơ cấu tổ chức</h2>
          <p className="text-muted-foreground">
            Sơ đồ cây trực quan
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Xuất sơ đồ
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border rounded-lg bg-slate-50/50 p-8 shadow-inner relative">
        <div 
          className="min-w-max mx-auto origin-top transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <Tree node={mockOrgData} />
        </div>
      </div>
    </div>
  )
}

const Tree = ({ node }: { node: OrgNode }) => {
  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} />
      {node.employees && node.employees.length > 0 && (
        <>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex gap-8 relative">
             {/* Connecting line top */}
            <div className="absolute top-0 left-1/2 -ml-px w-px h-4 bg-border"></div>
            
            {/* Horizontal line */}
            {node.employees.length > 1 && (
                 <div className="absolute top-0 left-0 right-0 h-px bg-border mt-0"
                    style={{ 
                        left: `calc(100% / ${node.employees.length * 2})`, 
                        right: `calc(100% / ${node.employees.length * 2})`
                    }}
                 ></div>
            )}
            
            {node.employees.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center relative pt-4">
                {/* Vertical line specifically for this child */}
                <div className="absolute top-0 left-1/2 -ml-px w-px h-4 bg-border"></div>
                <Tree node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const NodeCard = ({ node }: { node: OrgNode }) => {
  return (
    <div className="relative group">
        <div className="w-64 bg-white rounded-xl border-t-4 border-t-primary shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex flex-col items-center gap-3 z-10 relative">
            <div className="absolute -top-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src={node.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {node.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
            </div>
            
            <div className="mt-5 text-center w-full">
                <h3 className="font-semibold text-sm truncate w-full" title={node.name}>{node.name}</h3>
                <p className="text-xs text-primary font-medium truncate w-full" title={node.position}>{node.position}</p>
                <div className="mt-2 text-[10px] text-muted-foreground bg-slate-50 py-1 px-2 rounded-full inline-block">
                    {node.department}
                </div>
            </div>

            {node.employees && node.employees.length > 0 && (
                <div className="absolute -bottom-3 bg-white px-2 py-0.5 rounded-full border shadow-sm text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {node.employees.length}
                </div>
            )}
        </div>
    </div>
  )
}
