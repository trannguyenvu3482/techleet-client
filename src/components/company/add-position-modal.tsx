"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { type Department } from "@/lib/api/company"

const positionFormSchema = z.object({
  positionName: z.string().min(1, "Position name is required").min(2, "Position name must be at least 2 characters"),
  positionCode: z.string().min(1, "Position code is required").min(2, "Position code must be at least 2 characters"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  level: z.string().min(1, "Level is required"),
  minSalary: z.string().optional(),
  maxSalary: z.string().optional(),
  isActive: z.boolean(),
})

type PositionFormData = z.infer<typeof positionFormSchema>

interface AddPositionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  departments: Department[]
}

export function AddPositionModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  departments 
}: AddPositionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      positionName: "",
      positionCode: "",
      description: "",
      departmentId: "",
      level: "",
      minSalary: "",
      maxSalary: "",
      isActive: true,
    },
  })

  const handleSubmit = async (data: PositionFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        departmentId: parseInt(data.departmentId),
        minSalary: data.minSalary ? parseInt(data.minSalary) : undefined,
        maxSalary: data.maxSalary ? parseInt(data.maxSalary) : undefined,
      }
      await onSubmit(submitData)
      form.reset()
    } catch (error) {
      console.error('Failed to submit position:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  const activeDepartments = departments?.filter(dept => dept.isActive)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
          <DialogDescription>
            Create a new job position with salary range and department assignment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="positionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="SE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeDepartments.map((dept) => (
                          <SelectItem 
                            key={dept.departmentId} 
                            value={dept.departmentId.toString()}
                          >
                            {dept.departmentName} ({dept.departmentCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Intern">Intern</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid">Mid</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Principal">Principal</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the position's responsibilities and requirements"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary (VND)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="15000000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary (VND)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25000000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Position"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
