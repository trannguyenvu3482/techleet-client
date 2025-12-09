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
import { type Position, type Department, type UpdatePositionRequest } from "@/lib/api/company";
import { Checkbox } from "@/components/ui/checkbox";

const positionFormSchema = z.object({
  positionName: z
    .string()
    .min(1, "Position name is required")
    .min(2, "Position name must be at least 2 characters"),
  positionCode: z
    .string()
    .min(1, "Position code is required")
    .min(2, "Position code must be at least 2 characters"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  level: z.string().min(1, "Level is required"),
  minSalary: z.string().optional(),
  maxSalary: z.string().optional(),
  isActive: z.boolean(),
});

type PositionFormData = z.infer<typeof positionFormSchema>;

interface EditPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: UpdatePositionRequest) => Promise<void>;
  position: Position | null;
  departments: Department[];
}

export function EditPositionModal({
  open,
  onOpenChange,
  onSubmit,
  position,
  departments,
}: EditPositionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  });

  useEffect(() => {
    if (position && open) {
      form.reset({
        positionName: position.positionName,
        positionCode: position.positionCode,
        description: position.description || "",
        departmentId: position.departmentId?.toString() || "",
        level: position.level?.toString() || "",
        minSalary: position.minSalary?.toString() || "",
        maxSalary: position.maxSalary?.toString() || "",
        isActive: position.isActive,
      });
    }
  }, [position, open, form]);

  const handleSubmit = async (data: PositionFormData) => {
    if (!position) return;

    setIsSubmitting(true);
    try {
      const submitData: UpdatePositionRequest = {
        positionName: data.positionName,
        positionCode: data.positionCode,
        description: data.description,
        departmentId: parseInt(data.departmentId),
        level: data.level,
        minSalary: data.minSalary ? parseInt(data.minSalary) : undefined,
        maxSalary: data.maxSalary ? parseInt(data.maxSalary) : undefined,
        isActive: data.isActive,
      };
      await onSubmit(position.positionId, submitData);
    } catch (error) {
      console.error("Failed to update position:", error);
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

  const activeDepartments = departments?.filter((dept) => dept.isActive);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Position</DialogTitle>
          <DialogDescription>
            Update position details.
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
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
                      placeholder="Descriptions..."
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
                      <Input type="number" placeholder="15000000" {...field} />
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
                      <Input type="number" placeholder="25000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      Inactive positions are hidden.
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
