import { DocumentDetail } from "@/components/documents/document-detail"

interface DocumentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params
  
  return <DocumentDetail documentId={id} />
}

export async function generateMetadata({ params }: DocumentPageProps) {
  const { id } = await params
  
  return {
    title: `Tài liệu #${id} - TechLeet`,
    description: 'Chi tiết tài liệu và xem trước nội dung'
  }
}
