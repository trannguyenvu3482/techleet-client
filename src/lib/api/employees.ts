import { Employee } from "@/components/employees/employee-table"
import { EmployeeFormData } from "@/components/employees/add-employee-modal"

export interface GetEmployeesParams {
  page?: number
  limit?: number
  keyword?: string
  gender?: boolean
  isActive?: boolean
  departmentId?: number[]
  positionId?: number[]
  baseSalaryFrom?: number
  baseSalaryTo?: number
  startDateFrom?: string
  startDateTo?: string
  birthDateFrom?: string
  birthDateTo?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface GetEmployeesResponse {
  data: Employee[]
  total: number
}

export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  address: string
  birthDate: string
  email: string
  gender: boolean
  startDate: string
  isActive?: boolean
  avatarUrl?: string
  phoneNumber: string
  baseSalary: number
  departmentId: number
  positionId: number
  permissions: number[]
}

// Client-side employee API functions that call our Next.js API routes
export const employeeAPI = {
  async getEmployees(params: GetEmployeesParams = {}): Promise<GetEmployeesResponse> {
    const searchParams = new URLSearchParams()

    // Add all parameters to search params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    const response = await fetch(`/api/employees?${searchParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to fetch employees')
    }

    const data = await response.json()
    return {
      data: data.data,
      total: data.total
    }
  },

  async createEmployee(data: EmployeeFormData): Promise<Employee> {
    const requestData: CreateEmployeeRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      birthDate: new Date(data.birthDate).toISOString(),
      email: data.email,
      gender: data.gender,
      startDate: new Date(data.startDate).toISOString(),
      isActive: data.isActive,
      avatarUrl: data.avatarUrl,
      phoneNumber: data.phoneNumber,
      baseSalary: data.baseSalary,
      departmentId: data.departmentId,
      positionId: data.positionId,
      permissions: data.permissions,
    }

    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create employee')
    }

    const result = await response.json()
    return result.data
  },

  async updateEmployee(employeeId: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    // TODO: Implement update API route
    throw new Error('Update employee not implemented yet')
  },

  async getMyProfile(): Promise<Employee> {
    const response = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to fetch profile')
    }

    const result = await response.json()
    return result.data
  },
}
