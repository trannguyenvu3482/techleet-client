"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ZoomIn,
  ZoomOut,
  Download,
  Building2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { companyAPI, Department, Position } from "@/lib/api/company";
import { employeeAPI } from "@/lib/api/employees";
import { Employee } from "./employee-table";
import { toast } from "sonner";

interface OrgNode {
  id: string;
  name: string;
  title: string;
  type: "company" | "department" | "position" | "employee";
  avatarUrl?: string;
  children?: OrgNode[];
  isExpanded?: boolean;
  details?: any;
}

export function OrganizationalChart() {
  const [zoom, setZoom] = React.useState(1);
  const [data, setData] = React.useState<OrgNode | null>(null);
  const [loading, setLoading] = React.useState(true);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptRes, posRes, empRes] = await Promise.all([
          companyAPI.getDepartments({ limit: 100 }),
          companyAPI.getPositions({ limit: 100 }),
          employeeAPI.getEmployees({ limit: 1000 }),
        ]);

        const departments = deptRes.data;
        const positions = posRes.data;
        const employees = empRes.data;

        // Build Tree: Company -> Department -> Position -> Employee
        const tree: OrgNode = {
          id: "company",
          name: "TechLeet",
          title: "Công ty",
          type: "company",
          isExpanded: true,
          children: departments.map((dept): OrgNode => {
            const deptPositions = positions.filter(
              (p) => p.departmentId === dept.departmentId
            );

            return {
              id: `dept-${dept.departmentId}`,
              name: dept.departmentName,
              title: "Phòng ban",
              type: "department",
              isExpanded: true,
              children: deptPositions
                .map((pos): OrgNode => {
                  const posEmployees = employees.filter(
                    (e) => e.positionId === pos.positionId
                  );

                  return {
                    id: `pos-${pos.positionId}`,
                    name: pos.positionName,
                    title: "Chức vụ",
                    type: "position",
                    isExpanded: true,
                    children: posEmployees.map(
                      (emp): OrgNode => ({
                        id: `emp-${emp.employeeId}`,
                        name: `${emp.firstName} ${emp.lastName}`,
                        title: pos.positionName,
                        type: "employee",
                        avatarUrl: emp.avatarUrl,
                        details: emp,
                      })
                    ),
                  };
                })
                .filter((node) => true),
            };
          }),
        };

        setData(tree);
      } catch (error) {
        toast.error("Không thể tải dữ liệu sơ đồ tổ chức");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        Đang tải sơ đồ...
      </div>
    );
  }

  return (
    <div className="h-[800px] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cơ cấu tổ chức</h2>
          <p className="text-muted-foreground">
            Sơ đồ cây theo Phòng ban & Chức vụ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
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
          {data && <Tree node={data} />}
        </div>
      </div>
    </div>
  );
}

const Tree = ({ node }: { node: OrgNode }) => {
  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} />
      {node.children && node.children.length > 0 && (
        <>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex gap-8 relative">
            {/* Connecting line top */}
            <div className="absolute top-0 left-1/2 -ml-px w-px h-4 bg-border"></div>

            {/* Horizontal line */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 left-0 right-0 h-px bg-border mt-0"
                style={{
                  left: `calc(100% / ${node.children.length * 2})`,
                  right: `calc(100% / ${node.children.length * 2})`,
                }}
              ></div>
            )}

            {node.children.map((child, index) => (
              <div
                key={child.id}
                className="flex flex-col items-center relative pt-4"
              >
                {/* Vertical line specifically for this child */}
                <div className="absolute top-0 left-1/2 -ml-px w-px h-4 bg-border"></div>
                <Tree node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const NodeCard = ({ node }: { node: OrgNode }) => {
  const getIcon = () => {
    switch (node.type) {
      case "company":
        return <Building2 className="h-4 w-4 text-white" />;
      case "department":
        return <Building2 className="h-4 w-4 text-primary" />;
      case "position":
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (node.type) {
      case "company":
        return "bg-slate-800 text-white border-slate-700";
      case "department":
        return "bg-white border-primary/50";
      case "position":
        return "bg-white border-orange-200";
      case "employee":
        return "bg-white border-slate-200";
    }
  };

  if (node.type === "employee") {
    return (
      <div className="w-48 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all p-3 flex items-center gap-3 relative group">
        <Avatar className="h-8 w-8 border shadow-sm">
          <AvatarImage src={node.avatarUrl} />
          <AvatarFallback className="bg-slate-100 text-[10px]">
            {node.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium text-xs break-words">{node.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">
            {node.details?.email}
          </div>
        </div>
        {node.details?.isActive === false && (
          <div className="absolute top-0 right-0 p-1">
            <span
              className="h-2 w-2 rounded-full bg-red-400 block"
              title="Không hoạt động"
            ></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative group w-auto min-w-[180px] rounded-xl border-t-4 shadow-sm p-3 flex flex-col items-center gap-2 z-10 ${getColors()}`}
    >
      {node.type === "company" ? (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-700 rounded-lg">{getIcon()}</div>
          <div className="font-bold text-sm">{node.name}</div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            {getIcon()}
            {node.title}
          </div>
          <div className="font-bold text-sm">{node.name}</div>
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div className="mt-1 bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-100 shadow-sm text-[10px] font-medium text-slate-500 flex items-center gap-1">
          <Users className="h-3 w-3" />
          {node.children.length}
        </div>
      )}
    </div>
  );
};
