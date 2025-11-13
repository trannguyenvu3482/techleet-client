"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  FileText,
  Briefcase,
  ExternalLink,
  User,
  Award,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { recruitmentAPI, Candidate, Application } from "@/lib/api/recruitment"
import { StatusBadge } from "@/components/recruitment/status-badge"

interface CandidateQuickPreviewProps {
  candidateId: number
  applicationId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidateQuickPreview({
  candidateId,
  applicationId,
  open,
  onOpenChange,
}: CandidateQuickPreviewProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && candidateId) {
      fetchCandidateData()
    }
  }, [open, candidateId, applicationId])

  const fetchCandidateData = async () => {
    try {
      setLoading(true)
      const candidateData = await recruitmentAPI.getCandidateById(candidateId)
      setCandidate(candidateData)

      if (applicationId) {
        try {
          const applicationData = await recruitmentAPI.getApplicationById(applicationId)
          setApplication(applicationData)
        } catch (error) {
          console.error("Error fetching application:", error)
        }
      } else if (candidateData.currentApplication) {
        setApplication(candidateData.currentApplication)
      }
    } catch (error) {
      console.error("Error fetching candidate:", error)
    } finally {
      setLoading(false)
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatScore = (score: number | null) => {
    if (score === null) return "Chưa có điểm"
    return `${Math.round(score)}%`
  }

  if (!candidate && !loading) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : candidate ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {candidate.firstName} {candidate.lastName}
                  </div>
                  {application && (
                    <div className="text-sm text-muted-foreground">
                      {application.jobPosting?.title}
                    </div>
                  )}
                </div>
              </SheetTitle>
              <SheetDescription>
                Thông tin nhanh về ứng viên
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {/* Status */}
              {application && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trạng thái:</span>
                  <StatusBadge status={application.status} type="application" />
                </div>
              )}

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidate.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Info */}
              {application && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin ứng tuyển</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {application.score !== null && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          Điểm số: {formatScore(application.score)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Ngày nộp: {formatDate(application.createdAt)}
                      </span>
                    </div>
                    {application.jobPosting && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{application.jobPosting.title}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {candidate.education && candidate.education.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Học vấn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {candidate.education.map((edu, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{edu.degree}</div>
                          {edu.school && (
                            <div className="text-muted-foreground">{edu.school}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {candidate.experience && candidate.experience.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Kinh nghiệm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {candidate.experience.map((exp, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{exp.position}</div>
                          {exp.company && (
                            <div className="text-muted-foreground">{exp.company}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4">
                <Link
                  href={`/recruitment/candidate/detail/${candidateId}${applicationId ? `?applicationId=${applicationId}` : ""}`}
                  onClick={() => onOpenChange(false)}
                >
                  <Button className="w-full" variant="default">
                    <FileText className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </Button>
                </Link>
                {application && (
                  <Link
                    href={`/recruitment/jobs/${application.jobPostingId}`}
                    onClick={() => onOpenChange(false)}
                  >
                    <Button className="w-full" variant="outline">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Xem vị trí tuyển dụng
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

