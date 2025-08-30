import { NextRequest, NextResponse } from 'next/server'
import { serverApi } from '@/lib/api/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const params: Record<string, unknown> = {}
    
    // Pagination
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    if (page !== null) params.page = parseInt(page)
    if (limit !== null) params.limit = parseInt(limit)
    
    // Search
    const keyword = searchParams.get('keyword')
    if (keyword) params.keyword = keyword
    
    // Sorting
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    if (sortBy) params.sortBy = sortBy
    if (sortOrder) params.sortOrder = sortOrder
    
    // Filters
    const gender = searchParams.get('gender')
    const isActive = searchParams.get('isActive')
    if (gender !== null) params.gender = gender === 'true'
    if (isActive !== null) params.isActive = isActive === 'true'
    
    // Array filters
    const departmentIds = searchParams.getAll('departmentId')
    const positionIds = searchParams.getAll('positionId')
    if (departmentIds.length > 0) params.departmentId = departmentIds.map(id => parseInt(id))
    if (positionIds.length > 0) params.positionId = positionIds.map(id => parseInt(id))
    
    // Salary range
    const baseSalaryFrom = searchParams.get('baseSalaryFrom')
    const baseSalaryTo = searchParams.get('baseSalaryTo')
    if (baseSalaryFrom) params.baseSalaryFrom = parseInt(baseSalaryFrom)
    if (baseSalaryTo) params.baseSalaryTo = parseInt(baseSalaryTo)
    
    // Date ranges
    const startDateFrom = searchParams.get('startDateFrom')
    const startDateTo = searchParams.get('startDateTo')
    const birthDateFrom = searchParams.get('birthDateFrom')
    const birthDateTo = searchParams.get('birthDateTo')
    if (startDateFrom) params.startDateFrom = startDateFrom
    if (startDateTo) params.startDateTo = startDateTo
    if (birthDateFrom) params.birthDateFrom = birthDateFrom
    if (birthDateTo) params.birthDateTo = birthDateTo

    // Call the server API with authentication
    const response = await serverApi.get<{ total: number; data: unknown[] }>('/api/v1/company-service/employees', params)
    
    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total
    })

  } catch (error) {
    console.error('Employee API error:', error)
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message.includes('403')) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Call the server API to create employee
    const response = await serverApi.post('/api/v1/company-service/employees', body)

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Create employee API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message.includes('403')) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
      if (error.message.includes('400')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
