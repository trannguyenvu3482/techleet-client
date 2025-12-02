"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";

interface ScreeningScoresProps {
  overallScore: number | string | null;
  status?: string | null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

export function ScreeningScores({
  overallScore,
  status,
}: ScreeningScoresProps) {
  // Ensure overallScore is a number
  const score = typeof overallScore === 'number' ? overallScore : parseFloat(String(overallScore || 0));
  
  const scoreColor = getScoreColor(score);
  const scoreBgColor = getScoreBgColor(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Screening Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Score */}
          <div
            className={`p-6 rounded-lg border-2 ${scoreBgColor} text-center`}
          >
            <div className={`text-5xl font-bold ${scoreColor} mb-2`}>
              {score.toFixed(1)}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Overall Score
            </div>
          </div>

          {/* Status Badge */}
          {status && (
            <div className="flex items-center justify-center">
              <Badge variant={status === "passed" ? "default" : "secondary"}>
                {status === "passed" ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Passed
                  </>
                ) : (
                  status
                )}
              </Badge>
            </div>
          )}

          {/* Score Legend */}
          <div className="text-xs text-muted-foreground text-center space-y-1 pt-2 border-t">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full" />
                Excellent (≥80)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 bg-yellow-500 rounded-full" />
                Good (60-79)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 bg-red-500 rounded-full" />
                Needs Improvement (&lt;60)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

