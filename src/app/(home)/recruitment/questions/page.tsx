"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { QuestionsManager } from "@/components/recruitment/questions-manager"
import { QuestionSetsManager } from "@/components/recruitment/question-sets-manager"

export default function QuestionsManagementPage() {
  const [activeTab, setActiveTab] = useState("questions")
  
  return (
    <PageWrapper title="Quản lý Câu hỏi & Bộ đề">
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-4 py-3">
              <TabsList>
                <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
                <TabsTrigger value="question-sets">Bộ câu hỏi</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-4">
              <TabsContent value="questions">
                <QuestionsManager />
              </TabsContent>
              <TabsContent value="question-sets">
                <QuestionSetsManager />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
