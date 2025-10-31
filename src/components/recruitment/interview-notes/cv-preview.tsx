"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

interface CvPreviewProps {
  resumeUrl: string;
}

export function CvPreview({ resumeUrl }: CvPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [resumeUrl]);

  const getFileUrl = () => {
    if (resumeUrl.startsWith("http")) {
      return resumeUrl;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
    return `${apiUrl}/api/v1/recruitment-service/${resumeUrl}`;
  };

  const handleDownload = () => {
    const url = getFileUrl();
    window.open(url, "_blank");
  };

  const documents = [
    {
      uri: getFileUrl(),
      fileType: resumeUrl.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV/Resume
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden" style={{ minHeight: "500px", maxHeight: "600px" }}>
          {loading && (
            <div className="flex items-center justify-center h-[500px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading CV...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  Download CV instead
                </Button>
              </div>
            </div>
          )}
          <DocViewer
            documents={documents}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
              },
            }}
            onDocumentLoad={() => {
              setLoading(false);
            }}
            onError={(error) => {
              setError("Failed to load CV preview");
              setLoading(false);
            }}
            style={{ height: "500px" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

