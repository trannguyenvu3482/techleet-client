"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  Pin,
  FileText,
  Calendar,
  User,
  Eye,
  Tag,
  Clock,
  Shield,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { mockDocuments, type Document } from "@/data/mock-documents";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

interface DocumentDetailProps {
  documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Find document by ID
        const foundDocument = mockDocuments.find(
          (doc) => doc.documentId === parseInt(documentId)
        );
        setDocument(foundDocument || null);
      } catch (error) {
        console.error("Failed to fetch document:", error);
        toast.error("Không thể tải thông tin tài liệu");
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const handleDownload = async () => {
    if (!document) return;

    try {
      // Simulate download
      toast.success(`Tải xuống "${document.title}" thành công`);

      // Update download count
      document.downloadCount += 1;
      setDocument({ ...document });
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.error("Không thể tải xuống tài liệu");
    }
  };

  const handleTogglePin = async () => {
    if (!document) return;

    try {
      // Find the document in mock data and toggle its pinned status
      const documentToToggle = mockDocuments.find(
        (doc) => doc.documentId === document.documentId
      );
      if (documentToToggle) {
        documentToToggle.isPinned = !documentToToggle.isPinned;
        const action = documentToToggle.isPinned ? "ghim" : "bỏ ghim";
        toast.success(
          `${
            action.charAt(0).toUpperCase() + action.slice(1)
          } tài liệu thành công`
        );
        setDocument({ ...documentToToggle });
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      toast.error("Không thể thay đổi trạng thái ghim");
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      return;
    }

    try {
      // Simulate delete - remove from local state
      const documentToDelete = mockDocuments.find(
        (doc) => doc.documentId === document.documentId
      );
      if (documentToDelete) {
        const index = mockDocuments.indexOf(documentToDelete);
        mockDocuments.splice(index, 1);
      }

      toast.success("Xóa tài liệu thành công");
      router.push("/documents");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Không thể xóa tài liệu");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      onboarding: "bg-blue-100 text-blue-800",
      "chính sách": "bg-green-100 text-green-800",
      "quy định": "bg-red-100 text-red-800",
      "mẫu biểu": "bg-purple-100 text-purple-800",
      "đào tạo": "bg-yellow-100 text-yellow-800",
      "quy trình": "bg-indigo-100 text-indigo-800",
      "hợp đồng": "bg-pink-100 text-pink-800",
      "an toàn": "bg-orange-100 text-orange-800",
    };
    return colors[categoryName.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Không tìm thấy tài liệu
          </h3>
          <p className="text-muted-foreground mb-4">
            Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
          <Button onClick={() => router.push("/documents")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  // Document viewer configuration
  // For demo purposes, we'll use a sample PDF URL since we don't have actual files
  const docs = [
    {
      uri: "https://techleet.me/api/v1/recruitment-service/uploads/test-cv-senior.pdf",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/documents")}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTogglePin}>
            <Pin
              className={`mr-2 h-4 w-4 ${
                document.isPinned ? "text-orange-500" : ""
              }`}
            />
            {document.isPinned ? "Bỏ ghim" : "Ghim"}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer - Left Side */}
        <div className="lg:col-span-2">
          <Card className="max-h-fit">
            <DocViewer
              documents={docs}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                  retainURLParams: true,
                },
              }}
              pluginRenderers={DocViewerRenderers}
            />
          </Card>
        </div>

        {/* Document Information - Right Side */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin tài liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên tài liệu
                </label>
                <p className="text-sm break-words">
                  {document.title}
                </p>
              </div>

               <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </label>
                <p className="text-sm break-words">
                  {document.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên file gốc
                </label>
                <p className="text-sm break-words">
                  {document.originalFileName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kích thước
                </label>
                <p className="text-sm">{formatFileSize(document.fileSize)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phiên bản
                </label>
                <p className="text-sm">v{document.version}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Loại file
                </label>
                <p className="text-sm">{document.mimeType}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Danh mục
                </label>
                <Badge
                  className={
                    getCategoryColor(document.category.categoryName) +
                    " text-xs"
                  }
                >
                  <span className="mr-1">{document.category.icon}</span>
                  {document.category.categoryName}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Trạng thái
                </label>
                <div className="flex items-center gap-2">
                  {document.isPublic ? (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Công khai
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Riêng tư
                    </Badge>
                  )}
                  {document.isPinned && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      Đã ghim
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Lượt tải xuống
                </label>
                <p className="text-2xl font-bold text-primary">
                  {document.downloadCount}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Người tải lên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Người tải lên
                </label>
                <p className="text-sm">
                  {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {document.uploadedBy.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ngày tải lên
                </label>
                <p className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(document.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(document.updatedAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {document.approvedBy && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Người phê duyệt
                    </label>
                    <p className="text-sm">
                      {document.approvedBy.firstName}{" "}
                      {document.approvedBy.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.approvedBy.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ngày phê duyệt
                    </label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {document.approvedAt &&
                        new Date(document.approvedAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                    </p>
                  </div>
                </>
              )}

              {document.expirationDate && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ngày hết hạn
                    </label>
                    <p className="text-sm flex items-center gap-1 text-red-600">
                      <Calendar className="h-3 w-3" />
                      {new Date(document.expirationDate).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {document.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
