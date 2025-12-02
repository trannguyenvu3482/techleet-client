"use client";

/**
 * Model Comparison Client Component
 * 
 * So sánh 3 AI models (Gemini, ChatGPT, DeepSeek) khi chạy CV screening flow
 * Hiện tại giả sử đang dùng cùng 1 flow nhưng với 3 models khác nhau
 */

import { useState, useEffect } from "react";
import { Bot, Sparkles, Zap, Loader2, CheckCircle, AlertCircle, FileText, Settings, Briefcase, Clock, Brain, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { recruitmentAPI, type CvTestRequest, type CvTestResult } from "@/lib/api/recruitment";

interface ModelResult extends CvTestResult {
  modelId: string;
  modelName: string;
  loading: boolean;
}

const AI_MODELS = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Mô hình AI mạnh mẽ của Google",
    modelVersion: "Gemini 2.5 Pro",  // Fake display name
    badge: "BEST",
    badgeColor: "bg-blue-600 text-white",
    embeddingModel: "gemini-embedding-001",
    embeddingUrl: "https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: Bot,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Mô hình AI từ OpenAI",
    modelVersion: "GPT-4o",  // Fake display name
    badge: "PREMIUM",
    badgeColor: "bg-green-600 text-white",
    embeddingModel: "text-embedding-3-small",
    embeddingUrl: "https://platform.openai.com/docs/models/text-embedding-3-small"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Mô hình AI hiệu suất cao",
    modelVersion: "DeepSeek V3",  // Fake display name
    badge: "FAST",
    badgeColor: "bg-purple-600 text-white",
    embeddingModel: null,
    embeddingUrl: null,
    embeddingNote: "Chưa hỗ trợ embedding model"
  },
];

export function ModelComparisonClient() {
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<Record<string, ModelResult | null>>({});
  const [applications, setApplications] = useState<Array<{ applicationId: number; candidateName: string; jobTitle: string; appliedDate: string }>>([]);
  const [testMode, setTestMode] = useState<'mock' | 'real'>('mock');
  const [testData, setTestData] = useState<CvTestRequest>({
    filePath: "./uploads/test-cv.pdf",
    jobPostingId: 1,
    mockApplicationId: 9999
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock JD for testing
  const mockJobDescription = {
    jobPostingId: 999,
    title: 'Software Engineer',
    skills: 'JavaScript, React, Node.js, TypeScript',
    minExperience: 2,
    maxExperience: 5,
    educationLevel: 'Bachelor degree',
    description: 'Test job posting for CV screening'
  };

  // Helper function to convert file path to full URL
  const getCvUrl = (filePath: string) => {
    if (filePath.startsWith('./uploads/')) {
      return filePath.replace('./uploads/', 'https://techleet.me/api/v1/recruitment-service/uploads/');
    }
    return filePath;
  };

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await recruitmentAPI.getApplicationsForTesting();
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error("Lỗi khi tải danh sách đơn ứng tuyển");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast.error("Vui lòng chọn file PDF!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File không được vượt quá 10MB!");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'candidate_resume');
      formData.append('referenceId', '123');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://techleet.me/api/v1';
      const response = await fetch(`${apiUrl}/api/v1/recruitment-service/files/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data); // Debug log
      
      // Backend returns response with data property containing FileResponseDto
      // Response structure: { statusCode, timestamp, path, data: { fileId, fileName, fileUrl, ... } }
      const fileData = data.data;
      
      if (!fileData || !fileData.fileName) {
        throw new Error('No file name in upload response');
      }
      
      // IMPORTANT: Files are stored in ./temp-uploads/ directory by multer
      // The backend file service doesn't move files to ./uploads/{fileType}/ yet
      // So we need to use the temp-uploads path for CV screening
      const filePath = `./temp-uploads/${fileData.fileName}`;
      
      console.log('File path for CV screening:', filePath); // Debug log
      setTestData(prev => ({ ...prev, filePath }));
      toast.success(`Đã upload file: ${file.name}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Lỗi khi upload file CV!");
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompareModels = async () => {
    setIsComparing(true);
    
    // Initialize loading states for all models
    const initialResults: Record<string, ModelResult | null> = {};
    AI_MODELS.forEach((model) => {
      initialResults[model.id] = null;
    });
    setResults(initialResults);

    try {
      // Prepare test data based on mode
      const requestData: CvTestRequest = {
        filePath: testData.filePath,
        jobPostingId: testData.jobPostingId,
      };

      if (testMode === 'mock') {
        requestData.mockApplicationId = testData.mockApplicationId;
      } else {
        requestData.applicationId = testData.applicationId;
      }

      // Run CV screening for each model sequentially with different configs
      for (const model of AI_MODELS) {
        // Set loading state - create a proper ModelResult with all required fields
        setResults(prev => ({
          ...prev,
          [model.id]: {
            modelId: model.id,
            modelName: model.name,
            loading: true,
            success: false,
            extractedText: '',
            scores: { overallScore: 0, skillsScore: 0, experienceScore: 0, educationScore: 0 },
            summary: {
              summary: '',
              highlights: [],
              concerns: [],
              recommendation: '',
              fitScore: 0,
              skillsAssessment: { 
                technicalSkills: [], 
                experienceLevel: '', 
                strengthAreas: [], 
                improvementAreas: [] 
              }
            },
            processedData: {
              skills: { 
                technical: [], 
                soft: [], 
                languages: [], 
                frameworks: [], 
                tools: [], 
                certifications: [] 
              },
              experienceYears: 0,
              education: [],
              workExperience: []
            },
            testInfo: {
              filePath: requestData.filePath,
              jobPostingId: requestData.jobPostingId,
              mockApplicationId: requestData.mockApplicationId || 0
            },
            processingTimeMs: 0
          } as ModelResult
        }));

        // Call API with different model config for each model
        // Each model will use different Gemini model variant and parameters
        const startTime = Date.now();
        const modelRequest = {
          ...requestData,
          modelConfig: model.id as 'gemini' | 'chatgpt' | 'deepseek'
        };
        
        const result = await recruitmentAPI.testCvScreening(modelRequest);
        const processingTime = Date.now() - startTime;

        // Update result for this model
        setResults(prev => ({
          ...prev,
          [model.id]: {
            ...result,
            modelId: model.id,
            modelName: model.name,
            loading: false,
            processingTimeMs: processingTime
          } as ModelResult
        }));
      }

      toast.success("Đã so sánh thành công với 3 models!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi so sánh các mô hình!");
      console.error(error);
    } finally {
      setIsComparing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const hasResults = Object.values(results).some(r => r !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">So sánh Model AI</h1>
          <p className="text-muted-foreground">
            So sánh kết quả CV Screening từ 3 mô hình AI: Gemini, ChatGPT và DeepSeek
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Brain className="mr-1 h-3 w-3" />
          3 AI Models
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
              Thiết lập tham số cho việc so sánh CV screening với 3 models
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
              <Label>File CV:</Label>
              
              {/* File Upload Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-file-upload"
                    disabled={isUploading || isComparing}
                  />
                  <label
                    htmlFor="cv-file-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang upload...
                      </>
                    ) : selectedFile ? (
                      <>
                        <FileText className="h-4 w-4" />
                        {selectedFile.name}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Chọn file CV (PDF)
                      </>
                    )}
                  </label>
                </div>
                
                {selectedFile && !isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setTestData({ ...testData, filePath: "./uploads/test-cv.pdf" });
                    }}
                    title="Xóa file đã chọn"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {testData.filePath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const cvUrl = getCvUrl(testData.filePath);
                      window.open(cvUrl, '_blank');
                    }}
                    disabled={!testData.filePath}
                    title="Xem file CV hiện tại"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Or use path input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc nhập đường dẫn
                  </span>
                </div>
              </div>

              <Input
                value={testData.filePath}
                onChange={(e) => {
                  setTestData({ ...testData, filePath: e.target.value });
                  setSelectedFile(null);
                }}
                placeholder="./uploads/test-cv.pdf"
                disabled={isUploading}
              />
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
              onClick={handleCompareModels} 
              disabled={isComparing}
              className="w-full"
            >
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang so sánh với 3 models...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  So sánh 3 Models
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
                  onClick={() => {
                    setTestData({ ...testData, filePath: "./uploads/test-cv.pdf" });
                    setSelectedFile(null);
                  }}
                >
                  CV Junior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTestData({ ...testData, filePath: "./uploads/test-cv-senior.pdf" });
                    setSelectedFile(null);
                  }}
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

        {/* Models Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Thông tin Models
            </CardTitle>
            <CardDescription>
              3 mô hình AI sẽ được so sánh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {AI_MODELS.map((model) => {
                const ModelIcon = model.icon;
                const result = results[model.id];
                
                return (
                  <div key={model.id} className={`flex items-center justify-between p-3 rounded-lg ${model.bgColor} border ${model.borderColor}`}>
                    <div className="flex items-center gap-3">
                      <ModelIcon className={`h-5 w-5 ${model.color}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">{model.name}</div>
                          <Badge className={`text-xs ${model.badgeColor}`}>
                            {model.badge}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {model.description} • {model.modelVersion}
                        </div>
                      </div>
                    </div>
                    {result && !result.loading && (
                      <Badge variant="outline" className="text-xs">
                        {(result.processingTimeMs / 1000).toFixed(1)}s
                      </Badge>
                    )}
                    {result && result.loading && (
                      <Loader2 className={`h-4 w-4 animate-spin ${model.color}`} />
                    )}
                    {!result && !isComparing && (
                      <Badge variant="secondary">Chưa chạy</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Lưu ý</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Cùng 1 CV sẽ được xử lý bởi 3 models</li>
                <li>• Kết quả có thể khác nhau giữa các models</li>
                <li>• Thời gian xử lý phụ thuộc vào từng model</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {hasResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Kết quả so sánh</h2>
            <Badge variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              {testData.filePath}
            </Badge>
          </div>

          {/* Desktop View - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_MODELS.map((model) => {
              const ModelIcon = model.icon;
              const result = results[model.id];
              
              return (
                <Card key={model.id} className={`${model.borderColor} border-2`}>
                  <CardHeader className={model.bgColor}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ModelIcon className={`h-5 w-5 ${model.color}`} />
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                        </div>
                        {result && !result.loading && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {(result.processingTimeMs / 1000).toFixed(1)}s
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${model.badgeColor}`}>
                          {model.badge}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">
                          {model.modelVersion}
                        </span>
                      </div>
                      
                      {/* Embedding Model Info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Brain className="h-3 w-3" />
                        {model.embeddingModel ? (
                          <a 
                            href={model.embeddingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            {model.embeddingModel}
                          </a>
                        ) : (
                          <span className="italic">{model.embeddingNote}</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {!result || result.loading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className={`h-8 w-8 animate-spin ${model.color}`} />
                        <p className="text-sm text-muted-foreground">
                          Đang xử lý CV...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Scores */}
                        {result.scores && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(result.scores.overallScore || 0)}`}>
                              {result.scores.overallScore || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Tổng điểm</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(result.scores.skillsScore || 0)}`}>
                              {result.scores.skillsScore || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Kỹ năng</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(result.scores.experienceScore || 0)}`}>
                              {result.scores.experienceScore || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Kinh nghiệm</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(result.scores.educationScore || 0)}`}>
                              {result.scores.educationScore || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Học vấn</div>
                          </div>
                        </div>
                        )}

                        <Separator />

                        {/* Summary */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Tóm tắt</h4>
                          <p className="text-xs leading-relaxed bg-muted p-3 rounded-lg">
                            {result.summary?.summary || 'Không có thông tin'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={getScoreBadgeVariant(result.summary?.fitScore || 0)} className="text-xs">
                              Fit: {result.summary?.fitScore || 0}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">{result.summary?.recommendation || 'N/A'}</Badge>
                          </div>
                        </div>

                        <Separator />

                        {/* Highlights */}
                        {result.summary?.highlights && result.summary.highlights.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Điểm mạnh
                          </h4>
                          <ul className="space-y-1">
                            {result.summary.highlights.slice(0, 2).map((highlight, index) => (
                              <li key={index} className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-200">
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                        )}

                        {/* Concerns */}
                        {result.summary?.concerns && result.summary.concerns.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            Cần lưu ý
                          </h4>
                          <ul className="space-y-1">
                            {result.summary.concerns.slice(0, 2).map((concern, index) => (
                              <li key={index} className="text-xs bg-amber-50 p-2 rounded border-l-2 border-amber-200">
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && !isComparing && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="flex gap-4">
              {AI_MODELS.map((model) => {
                const ModelIcon = model.icon;
                return (
                  <div key={model.id} className="relative">
                    <div className={`p-4 rounded-full ${model.bgColor}`}>
                      <ModelIcon className={`h-8 w-8 ${model.color}`} />
                    </div>
                    <Badge className={`absolute -top-2 -right-2 text-xs ${model.badgeColor}`}>
                      {model.badge}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Chưa có kết quả so sánh</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Cấu hình test ở trên và nhấn &apos;So sánh 3 Models&apos; để xem kết quả CV screening từ Gemini 2.5 Pro, GPT-4o và DeepSeek V3
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
