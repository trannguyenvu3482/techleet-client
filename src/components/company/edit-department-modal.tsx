"use client";

import { useEffect, useState } from "react";
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
import { type Department, type UpdateDepartmentRequest } from "@/lib/api/company";
import { Checkbox } from "@/components/ui/checkbox";

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

interface EditDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: UpdateDepartmentRequest) => Promise<void>;
  department: Department | null;
  departments: Department[];
}

export function EditDepartmentModal({
  open,
  onOpenChange,
  onSubmit,
  department,
  departments = [],
}: EditDepartmentModalProps) {
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

  // Load department data when modal opens or department changes
  useEffect(() => {
    if (department && open) {
      form.reset({
        departmentName: department.departmentName,
        departmentCode: department.departmentCode,
        description: department.description || "",
        parentDepartmentId: department.parentDepartmentId 
          ? department.parentDepartmentId.toString() 
          : "none",
        isActive: department.isActive,
      });
    }
  }, [department, open, form]);

  const handleSubmit = async (data: DepartmentFormData) => {
    if (!department) return;
    
    setIsSubmitting(true);
    try {
      const submitData: UpdateDepartmentRequest = {
        departmentName: data.departmentName,
        departmentCode: data.departmentCode,
        description: data.description,
        isActive: data.isActive,
        parentDepartmentId:
          data.parentDepartmentId && data.parentDepartmentId !== "none"
            ? parseInt(data.parentDepartmentId)
            : undefined,
      };
      await onSubmit(department.departmentId, submitData);
    } catch (error) {
      console.error("Failed to update department:", error);
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

  // Filter out self and descendants to avoid circular references
  const availableParentDepartments = departments.filter((dept) => {
    if (!department) return true;
    if (dept.departmentId === department.departmentId) return false;
    // Simple check: if this dept's parent is the current department (direct child), exclude it.
    // Ideally we should do a recursive check, but 1-level for now or assume backend validation handles cycles.
    if (dept.parentDepartmentId === department.departmentId) return false;
    
    return dept.isActive;
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department details and hierarchy.
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
                      placeholder="Brief description..."
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent" />
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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Inactive departments are hidden from selection.
                    </p>
                  </div>
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
