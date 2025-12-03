"use client"

import { cn } from "@/lib/utils"

interface ScoreIndicatorProps {
  score: number | null | undefined
  maxScore?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  variant?: "circular" | "bar"
  className?: string
}

function getScoreColor(score: number, maxScore: number): string {
  if (isNaN(score) || isNaN(maxScore) || maxScore === 0) return "text-muted-foreground"
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "text-emerald-600"
  if (percentage >= 60) return "text-amber-600"
  if (percentage >= 40) return "text-orange-600"
  return "text-red-600"
}

function getScoreGradient(score: number, maxScore: number): string {
  if (isNaN(score) || isNaN(maxScore) || maxScore === 0) return "from-muted to-muted"
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "from-emerald-500 to-emerald-400"
  if (percentage >= 60) return "from-amber-500 to-amber-400"
  if (percentage >= 40) return "from-orange-500 to-orange-400"
  return "from-red-500 to-red-400"
}

function getScoreTrackColor(score: number, maxScore: number): string {
  if (isNaN(score) || isNaN(maxScore) || maxScore === 0) return "stroke-muted"
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "stroke-emerald-500"
  if (percentage >= 60) return "stroke-amber-500"
  if (percentage >= 40) return "stroke-orange-500"
  return "stroke-red-500"
}

const sizeConfig = {
  sm: { size: 32, strokeWidth: 3, fontSize: "text-[10px]" },
  md: { size: 48, strokeWidth: 4, fontSize: "text-xs" },
  lg: { size: 64, strokeWidth: 5, fontSize: "text-sm" },
}

export function ScoreIndicator({ 
  score, 
  maxScore = 100, 
  size = "md", 
  showLabel = true,
  variant = "circular",
  className 
}: ScoreIndicatorProps) {
  if (score === null || score === undefined || isNaN(score)) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "flex items-center justify-center rounded-full bg-muted",
          size === "sm" ? "h-8 w-8" : size === "md" ? "h-12 w-12" : "h-16 w-16"
        )}>
          <span className="text-muted-foreground text-xs">—</span>
        </div>
        {showLabel && <span className="text-muted-foreground text-sm">Đang xử lý</span>}
      </div>
    )
  }

  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100)
  const config = sizeConfig[size]
  
  if (variant === "bar") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-500",
              getScoreGradient(score, maxScore)
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={cn("font-semibold tabular-nums", config.fontSize, getScoreColor(score, maxScore))}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }

  // Circular variant
  const radius = (config.size - config.strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          className="transform -rotate-90"
          width={config.size}
          height={config.size}
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted"
          />
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-500", getScoreTrackColor(score, maxScore))}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold tabular-nums", config.fontSize, getScoreColor(score, maxScore))}>
            {Math.round(percentage)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-muted-foreground", config.fontSize)}>điểm</span>
      )}
    </div>
  )
}

