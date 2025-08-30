import { Employee } from "@/components/employees/employee-table"
import { EmployeeFormData } from "@/components/employees/add-employee-modal"
import { api } from "./client"
import { PaginatedResponse } from '@/types/api'

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

// Client-side employee API functions that call the API Gateway directly
export const employeeAPI = {
  async getEmployees(params: GetEmployeesParams = {}): Promise<GetEmployeesResponse> {
    const response = await api.get<PaginatedResponse<Employee>>('/api/v1/user-service/employee', params)
    return {
      data: response.data,
      total: response.total
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

    return api.post<Employee>('/api/v1/user-service/employee', requestData)
  },

  async updateEmployee(_employeeId: number, _data: Partial<EmployeeFormData>): Promise<Employee> {
    // TODO: Implement update API route
    throw new Error('Update employee not implemented yet')
  },

  async getMyProfile(): Promise<Employee> {
    return api.get<Employee>('/api/v1/user-service/employee/my-profile')
  },
}
