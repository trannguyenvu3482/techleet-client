// Examples of how to use the api client

import { api } from './client'

// Example usage patterns for the api client

export const examples = {
  // GET request with query parameters
  async getEmployees() {
    try {
      const employees = await api.get('/employee', {
        page: 0,
        limit: 10,
        keyword: 'john',
        isActive: true
      })
      return employees
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      throw error
    }
  },

  // POST request with body
  async createEmployee() {
    try {
      const newEmployee = await api.post('/employee', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '0123456789',
        address: '123 Main St',
        birthDate: '1990-01-01',
        gender: true,
        startDate: '2024-01-01',
        isActive: true,
        baseSalary: 15000000,
        departmentId: 1,
        positionId: 1,
        permissions: [1, 2]
      })
      return newEmployee
    } catch (error) {
      console.error('Failed to create employee:', error)
      throw error
    }
  },

  // PUT request
  async updateEmployee(employeeId: number) {
    try {
      const updatedEmployee = await api.put('/employee', {
        employeeId,
        firstName: 'Jane',
        lastName: 'Smith',
        baseSalary: 18000000
      })
      return updatedEmployee
    } catch (error) {
      console.error('Failed to update employee:', error)
      throw error
    }
  },

  // DELETE request with query parameters
  async deleteEmployee(employeeId: number) {
    try {
      const result = await api.delete('/employee', { employeeId })
      return result
    } catch (error) {
      console.error('Failed to delete employee:', error)
      throw error
    }
  },

  // GET request without parameters
  async getMyProfile() {
    try {
      const profile = await api.get('/employee/my-profile')
      return profile
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      throw error
    }
  },

  // File upload example
  async uploadAvatar(file: File, employeeId: number) {
    try {
      const result = await api.upload('/employee/avatar', file, {
        employeeId: employeeId.toString()
      })
      return result
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      throw error
    }
  },

  // Custom headers example
  async getEmployeesWithCustomHeaders() {
    try {
      const employees = await api.get('/employee', 
        { page: 0, limit: 5 }, 
        { 
          headers: { 
            'X-Custom-Header': 'custom-value' 
          } 
        }
      )
      return employees
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      throw error
    }
  },

  // Error handling example
  async handleApiErrors() {
    try {
      const result = await api.get('/non-existent-endpoint')
      return result
    } catch (error) {
      if (error instanceof Error) {
        // Handle different types of errors
        if (error.message.includes('404')) {
          console.log('Endpoint not found')
        } else if (error.message.includes('401')) {
          console.log('Unauthorized - redirect to login')
        } else if (error.message.includes('timeout')) {
          console.log('Request timed out')
        } else {
          console.log('Other error:', error.message)
        }
      }
      throw error
    }
  }
}

// Usage in React components:
/*
import { api } from '@/lib/api/client'

function MyComponent() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await api.get('/employee', { 
        page: 0, 
        limit: 10,
        isActive: true 
      })
      setEmployees(data.data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const createEmployee = async (employeeData) => {
    try {
      const newEmployee = await api.post('/employee', employeeData)
      setEmployees(prev => [newEmployee, ...prev])
      toast.success('Employee created successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create employee')
    }
  }

  return (
    // Your component JSX
  )
}
*/
