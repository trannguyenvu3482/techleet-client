"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Briefcase, Code, FileText } from "lucide-react";

interface CandidateInfoProps {
  candidate: {
    candidate_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    years_of_experience: number | null;
    skills: string | null;
    summary: string | null;
  };
}

export function CandidateInfo({ candidate }: CandidateInfoProps) {
  const skills = candidate.skills
    ? candidate.skills.split(",").map((s) => s.trim())
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Candidate Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div>
          <h3 className="font-semibold text-lg">
            {candidate.first_name} {candidate.last_name}
          </h3>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{candidate.email}</span>
          </div>
          {candidate.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.phone_number}</span>
            </div>
          )}
        </div>

        {/* Experience */}
        {candidate.years_of_experience !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>
              {candidate.years_of_experience}{" "}
              {candidate.years_of_experience === 1 ? "year" : "years"} of
              experience
            </span>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
              <Code className="h-4 w-4 text-muted-foreground" />
              Skills
            </div>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {candidate.summary && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Summary
            </div>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {candidate.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

