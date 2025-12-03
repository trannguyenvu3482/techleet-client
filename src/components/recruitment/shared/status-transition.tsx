"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge, ApplicationStatus } from "./status-badge"
import { ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useState } from "react"

interface StatusTransitionProps {
  currentStatus: ApplicationStatus | string
  onStatusChange: (newStatus: ApplicationStatus) => Promise<void>
  availableTransitions?: ApplicationStatus[]
  disabled?: boolean
}

// Define valid status transitions
const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ["screening", "rejected"],
  pending: ["screening", "rejected"],
  screening: ["screening_passed", "screening_failed", "rejected"],
  screening_passed: ["passed_exam", "failed_exam", "interviewing", "rejected"],
  screening_failed: ["rejected"],
  passed_exam: ["interviewing", "rejected"],
  failed_exam: ["rejected"],
  interviewing: ["offer", "rejected"],
  interview_scheduled: ["interviewing", "rejected"],
  offer: ["hired", "rejected"],
  hired: [],
  rejected: [],
  withdrawn: [],
}

export function StatusTransition({
  currentStatus,
  onStatusChange,
  availableTransitions,
  disabled = false,
}: StatusTransitionProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "">("")
  const [isUpdating, setIsUpdating] = useState(false)

  const transitions =
    availableTransitions ||
    STATUS_TRANSITIONS[currentStatus as ApplicationStatus] ||
    []

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return

    try {
      setIsUpdating(true)
      await onStatusChange(selectedStatus as ApplicationStatus)
      setSelectedStatus("")
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (transitions.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status={currentStatus} type="application" />
        <span className="text-sm text-muted-foreground">Không thể chuyển trạng thái</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={currentStatus} type="application" />
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value as ApplicationStatus)}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn trạng thái mới" />
        </SelectTrigger>
        <SelectContent>
          {transitions.map((status) => (
            <SelectItem key={status} value={status}>
              <StatusBadge status={status} type="application" />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedStatus && (
        <Button
          size="sm"
          onClick={handleStatusChange}
          disabled={disabled || isUpdating || selectedStatus === currentStatus}
        >
          {isUpdating ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Đang cập nhật...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Cập nhật
            </>
          )}
        </Button>
      )}
    </div>
  )
}

