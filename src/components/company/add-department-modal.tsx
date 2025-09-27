"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Department } from "@/lib/api/company";

const departmentFormSchema = z.object({
  departmentName: z
    .string()
    .min(1, "Department name is required")
    .min(2, "Department name must be at least 2 characters"),
  departmentCode: z
    .string()
    .min(1, "Department code is required")
    .min(2, "Department code must be at least 2 characters"),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  isActive: z.boolean(),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface AddDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    departmentName: string;
    departmentCode: string;
    isActive: boolean;
    description?: string;
    parentDepartmentId?: number;
  }) => Promise<void>;
  departments: Department[];
}

export function AddDepartmentModal({
  open,
  onOpenChange,
  onSubmit,
  departments = [],
}: AddDepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      departmentName: "",
      departmentCode: "",
      description: "",
      parentDepartmentId: "none",
      isActive: true,
    },
  });

  const handleSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        parentDepartmentId:
          data.parentDepartmentId && data.parentDepartmentId !== "none"
            ? parseInt(data.parentDepartmentId)
            : undefined,
      };
      await onSubmit(submitData);
      form.reset();
    } catch (error) {
      console.error("Failed to submit department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  // Filter out departments that could create circular references
  const availableParentDepartments = departments.filter(
    (dept) => dept.isActive
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Create a new department for your organization. You can set up
            hierarchy by selecting a parent department.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="ENG" {...field} />
                    </FormControl>
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
                      placeholder="Brief description of the department's role and responsibilities"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentDepartmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent department (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        No parent (Root department)
                      </SelectItem>
                      {availableParentDepartments.map((dept) => (
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
                {isSubmitting ? "Creating..." : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
