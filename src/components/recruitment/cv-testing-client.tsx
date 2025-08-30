"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Zap,
  Settings,
  Briefcase
} from "lucide-react"
import { toast } from "sonner"
import { recruitmentAPI, type CvTestRequest, type CvTestResult } from "@/lib/api/recruitment"

export function CvTestingClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CvTestResult | null>(null)
  const [applications, setApplications] = useState<Array<{ applicationId: number; candidateName: string; jobTitle: string; appliedDate: string }>>([])
  const [testMode, setTestMode] = useState<'mock' | 'real'>('mock')
  const [testData, setTestData] = useState<CvTestRequest>({
    filePath: "./uploads/test-cv.pdf",
    jobPostingId: 1,
    mockApplicationId: 9999
  })

  // Mock JD for testing
  const mockJobDescription = {
    jobPostingId: 999,
    title: 'Software Engineer',
    skills: 'JavaScript, React, Node.js, TypeScript',
    minExperience: 2,
    maxExperience: 5,
    educationLevel: 'Bachelor degree',
    description: 'Test job posting for CV screening'
  }

  // Helper function to convert file path to full URL
  const getCvUrl = (filePath: string) => {
    if (filePath.startsWith('./uploads/')) {
      return filePath.replace('./uploads/', 'https://techleet.me/api/v1/recruitment-service/uploads/')
    }
    return filePath
  }

  // Load applications on component mount
  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const apps = await recruitmentAPI.getApplicationsForTesting()
      setApplications(apps)
    } catch (error) {
      console.error('Error loading applications:', error)
      toast.error("Lỗi khi tải danh sách đơn ứng tuyển")
    }
  }

  const handleTest = async () => {
    setIsLoading(true)
    try {
      // Prepare test data based on mode
      const requestData: CvTestRequest = {
        filePath: testData.filePath,
        jobPostingId: testData.jobPostingId,
      }

      if (testMode === 'mock') {
        requestData.mockApplicationId = testData.mockApplicationId
      } else {
        requestData.applicationId = testData.applicationId
      }

      const result = await recruitmentAPI.testCvScreening(requestData)
      setResult(result)
      toast.success("CV screening test hoàn thành!")
    } catch (error) {
      console.error('Test error:', error)
      toast.error("Lỗi khi thực hiện test CV")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kiểm thử CV Screening</h1>
          <p className="text-muted-foreground">
            Thử nghiệm và đánh giá hiệu quả của hệ thống AI trong việc phân tích CV
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Brain className="mr-1 h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cấu hình Test
            </CardTitle>
            <CardDescription>
              Thiết lập tham số cho việc kiểm thử CV screening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Test Mode Selection */}
            <div className="space-y-2">
              <Label>Chế độ test:</Label>
              <div className="flex gap-2">
                <Button
                  variant={testMode === 'mock' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTestMode('mock')}
                >
                  Mock Data
                </Button>
                <Button
                  variant={testMode === 'real' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTestMode('real')}
                >
                  Real Applications
                </Button>
              </div>
            </div>

            {/* Mock JD Display */}
            {testMode === 'mock' && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-sm">Mock Job Description</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Position:</span> {mockJobDescription.title}
                  </div>
                  <div>
                    <span className="font-medium">Required Skills:</span> {mockJobDescription.skills}
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span> {mockJobDescription.minExperience}-{mockJobDescription.maxExperience} years
                  </div>
                  <div>
                    <span className="font-medium">Education:</span> {mockJobDescription.educationLevel}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {mockJobDescription.description}
                  </div>
                </div>
              </div>
            )}

            {/* Real Application Selection */}
            {testMode === 'real' && (
              <div className="space-y-2">
                <Label>Chọn đơn ứng tuyển:</Label>
                <Select 
                  value={testData.applicationId?.toString() || ""} 
                  onValueChange={(value) => setTestData({ ...testData, applicationId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn application để test" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.applicationId} value={app.applicationId.toString()}>
                        {app.candidateName} - {app.jobTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* File Path Input */}
            <div className="space-y-2">
              <Label>Đường dẫn file CV:</Label>
              <div className="flex gap-2">
                <Input
                  value={testData.filePath}
                  onChange={(e) => setTestData({ ...testData, filePath: e.target.value })}
                  placeholder="./uploads/test-cv.pdf"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cvUrl = testData.filePath.replace('./uploads/', 'https://techleet.me/api/v1/recruitment-service/uploads/')
                    window.open(cvUrl, '_blank')
                  }}
                  disabled={!testData.filePath || !testData.filePath.includes('./uploads/')}
                  title="Xem file CV hiện tại"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Job Posting ID Input */}
            <div className="space-y-2">
              <Label>Job Posting ID (optional):</Label>
              <Input
                type="number"
                value={testData.jobPostingId || ""}
                onChange={(e) => setTestData({ ...testData, jobPostingId: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>

            {/* Run Test Button */}
            <Button 
              onClick={handleTest} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Chạy Test CV Screening
                </>
              )}
            </Button>

            {/* Quick Test Options */}
            <div className="space-y-2">
              <Label>Test nhanh với file mẫu:</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestData({ ...testData, filePath: "./uploads/test-cv.pdf" })}
                >
                  CV Junior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestData({ ...testData, filePath: "./uploads/test-cv-senior.pdf" })}
                >
                  CV Senior
                </Button>
              </div>
              
              {/* View Sample CVs */}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://techleet.me/api/v1/recruitment-service/uploads/test-cv.pdf', '_blank')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  Xem CV Junior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://techleet.me/api/v1/recruitment-service/uploads/test-cv-senior.pdf', '_blank')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  Xem CV Senior
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Trạng thái hệ thống
            </CardTitle>
            <CardDescription>
              Thông tin về hiệu năng và trạng thái của hệ thống AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Service</span>
                <Badge variant="default">Hoạt động</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vector Database</span>
                <Badge variant="default">Kết nối</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Skill Taxonomy</span>
                <Badge variant="default">10 kỹ năng</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing Queue</span>
                <Badge variant="secondary">Sẵn sàng</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Thống kê gần đây</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CV đã test:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian TB:</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Điểm TB:</span>
                  <span>-</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kết quả phân tích CV
              <Badge variant="outline" className="ml-auto">
                <Clock className="mr-1 h-3 w-3" />
                {(result.processingTimeMs / 1000).toFixed(1)}s
              </Badge>
            </CardTitle>
            <CardDescription>
              Kết quả chi tiết từ hệ thống AI CV Screening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-sm text-blue-900">Job Description Used for Testing</h4>
              </div>
              <div className="space-y-1 text-sm text-blue-800">
                <div><span className="font-medium">Position:</span> {mockJobDescription.title}</div>
                <div><span className="font-medium">Required Skills:</span> {mockJobDescription.skills}</div>
                <div><span className="font-medium">Experience Range:</span> {mockJobDescription.minExperience}-{mockJobDescription.maxExperience} years</div>
                <div><span className="font-medium">Education:</span> {mockJobDescription.educationLevel}</div>
              </div>
            </div>

            {/* Overall Scores */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.scores.overallScore)}`}>
                  {result.scores.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">Tổng điểm</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.scores.skillsScore)}`}>
                  {result.scores.skillsScore}
                </div>
                <div className="text-sm text-muted-foreground">Kỹ năng</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.scores.experienceScore)}`}>
                  {result.scores.experienceScore}
                </div>
                <div className="text-sm text-muted-foreground">Kinh nghiệm</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.scores.educationScore)}`}>
                  {result.scores.educationScore}
                </div>
                <div className="text-sm text-muted-foreground">Học vấn</div>
              </div>
            </div>

            <Separator />

            {/* AI Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tóm tắt AI</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{result.summary.summary}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getScoreBadgeVariant(result.summary.fitScore)}>
                  Độ phù hợp: {result.summary.fitScore}%
                </Badge>
                <Badge variant="outline">{result.summary.recommendation}</Badge>
                <Badge variant="secondary">{result.summary.skillsAssessment.experienceLevel}</Badge>
              </div>
            </div>

            {/* Highlights & Concerns */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Điểm mạnh
                </h4>
                <ul className="space-y-2">
                  {result.summary.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm bg-green-50 p-2 rounded border-l-2 border-green-200">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-amber-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Điểm cần lưu ý
                </h4>
                <ul className="space-y-2">
                  {result.summary.concerns.map((concern, index) => (
                    <li key={index} className="text-sm bg-amber-50 p-2 rounded border-l-2 border-amber-200">
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Phân tích kỹ năng</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h4 className="font-medium mb-2">Kỹ năng kỹ thuật ({result.processedData.skills.technical.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.processedData.skills.technical.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Frameworks ({result.processedData.skills.frameworks.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.processedData.skills.frameworks.map((framework, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tools ({result.processedData.skills.tools.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.processedData.skills.tools.map((tool, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Info */}
            <div className="bg-muted p-3 rounded text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>File: {result.testInfo.filePath}</span>
                <span>Job ID: {result.testInfo.jobPostingId}</span>
                {testMode === 'mock' ? (
                  <span>Mock App: {result.testInfo.mockApplicationId}</span>
                ) : (
                  <span>Application ID: {testData.applicationId}</span>
                )}
                <Badge variant="outline" className="text-xs">
                  {testMode === 'mock' ? 'Mock Data' : 'Real Application'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
