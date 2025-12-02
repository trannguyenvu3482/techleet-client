"use client"

import * as React from "react"
import { Trash2, AlertTriangle, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ConfirmVariant = "danger" | "warning" | "info"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  variant?: ConfirmVariant
  loading?: boolean
}

const variantConfig: Record<ConfirmVariant, { 
  icon: React.ElementType
  iconClass: string
  buttonVariant: "destructive" | "default"
  bgClass: string
}> = {
  danger: {
    icon: Trash2,
    iconClass: "text-red-600",
    buttonVariant: "destructive",
    bgClass: "bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    buttonVariant: "default",
    bgClass: "bg-amber-50",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600",
    buttonVariant: "default",
    bgClass: "bg-blue-50",
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Confirm action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = loading || isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              config.bgClass
            )}>
              <Icon className={cn("h-6 w-6", config.iconClass)} />
            </div>
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-left">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-left">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDisabled}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isDisabled}
          >
            {isDisabled ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean
    title: string
    description?: string
    variant?: ConfirmVariant
    confirmText?: string
    onConfirm?: () => void | Promise<void>
  }>({
    open: false,
    title: "",
  })

  const confirm = React.useCallback((options: {
    title: string
    description?: string
    variant?: ConfirmVariant
    confirmText?: string
    onConfirm: () => void | Promise<void>
  }) => {
    setState({
      open: true,
      ...options,
    })
  }, [])

  const close = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false }))
  }, [])

  const DialogComponent = React.useCallback(() => (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => setState(prev => ({ ...prev, open }))}
      title={state.title}
      description={state.description}
      variant={state.variant}
      confirmText={state.confirmText}
      onConfirm={state.onConfirm || (() => {})}
    />
  ), [state])

  return { confirm, close, ConfirmDialog: DialogComponent }
}

