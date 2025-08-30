"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, Cell } from "recharts"
import { Users, Briefcase, Calendar, UserCheck } from "lucide-react"

// Sample data for charts
const recruitmentData = [
  { month: "Jan", applications: 45, hired: 8 },
  { month: "Feb", applications: 52, hired: 12 },
  { month: "Mar", applications: 38, hired: 6 },
  { month: "Apr", applications: 67, hired: 15 },
  { month: "May", applications: 71, hired: 18 },
  { month: "Jun", applications: 59, hired: 14 },
]

const departmentData = [
  { name: "Engineering", employees: 45, fill: "#8884d8" },
  { name: "Marketing", employees: 23, fill: "#82ca9d" },
  { name: "Sales", employees: 18, fill: "#ffc658" },
  { name: "HR", employees: 12, fill: "#ff7300" },
  { name: "Finance", employees: 8, fill: "#00ff00" },
]

const applicationStatusData = [
  { status: "Pending", count: 24, fill: "#fbbf24" },
  { status: "Reviewing", count: 18, fill: "#3b82f6" },
  { status: "Interview", count: 12, fill: "#8b5cf6" },
  { status: "Accepted", count: 8, fill: "#10b981" },
  { status: "Rejected", count: 15, fill: "#ef4444" },
]

const chartConfig = {
  applications: {
    label: "Applications",
    color: "#2563eb",
  },
  hired: {
    label: "Hired",
    color: "#10b981",
  },
} satisfies ChartConfig

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">106</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">77</div>
            <p className="text-xs text-muted-foreground">
              +12 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recruitment Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recruitment Trends</CardTitle>
            <CardDescription>
              Monthly applications and hiring statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={recruitmentData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="applications" fill="var(--color-applications)" />
                <Bar dataKey="hired" fill="var(--color-hired)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>
              Employee count by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="employees"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Current application pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New application received</p>
                  <p className="text-xs text-muted-foreground">Frontend Developer position - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Interview scheduled</p>
                  <p className="text-xs text-muted-foreground">John Doe - Backend Developer - Tomorrow 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Job posting published</p>
                  <p className="text-xs text-muted-foreground">Senior React Developer - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New employee onboarded</p>
                  <p className="text-xs text-muted-foreground">Jane Smith - Marketing Team - 3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
