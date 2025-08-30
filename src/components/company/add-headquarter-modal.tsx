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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const headquarterFormSchema = z.object({
  headquarterName: z.string().min(1, "Headquarter name is required").min(2, "Headquarter name must be at least 2 characters"),
  address: z.string().min(1, "Address is required").min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required").min(2, "City must be at least 2 characters"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required").min(2, "Country must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
})

type HeadquarterFormData = z.infer<typeof headquarterFormSchema>

interface AddHeadquarterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: HeadquarterFormData) => Promise<void>
}

export function AddHeadquarterModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: AddHeadquarterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<HeadquarterFormData>({
    resolver: zodResolver(headquarterFormSchema),
    defaultValues: {
      headquarterName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Vietnam",
      phoneNumber: "",
      email: "",
      isActive: true,
    },
  })

  const handleSubmit = async (data: HeadquarterFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        // Remove empty optional fields
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        phoneNumber: data.phoneNumber || undefined,
        email: data.email || undefined,
      }
      await onSubmit(submitData)
      form.reset()
    } catch (error) {
      console.error('Failed to submit headquarter:', error)
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Headquarter</DialogTitle>
          <DialogDescription>
            Add a new office location or regional headquarters for your company.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="headquarterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headquarter Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ho Chi Minh Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Nguyen Hue Street, District 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ho Chi Minh City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Ho Chi Minh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="700000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="Vietnam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+84 28 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="hcm@techleet.com" {...field} />
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
                {isSubmitting ? "Creating..." : "Create Headquarter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
