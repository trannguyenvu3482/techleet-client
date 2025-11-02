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
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RejectApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: number;
  onSuccess: () => void;
}

export function RejectApplicationDialog({
  open,
  onOpenChange,
  applicationId,
  onSuccess,
}: RejectApplicationDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { recruitmentAPI } = await import("@/lib/api");
      await recruitmentAPI.rejectApplicationAfterInterview(applicationId, {
        rejectionReason: rejectionReason || undefined,
      });

      toast.success("Đã từ chối ứng viên và gửi email thành công");
      onSuccess();
      onOpenChange(false);
      setConfirmOpen(false);
      setRejectionReason("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Từ chối ứng viên</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối (tùy chọn). Email từ chối sẽ được gửi đến ứng viên.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rejectionReason">Lý do từ chối (tùy chọn)</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="VD: Không phù hợp với văn hóa công ty..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                Xác nhận từ chối
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn từ chối ứng viên này? Email từ chối sẽ được gửi ngay lập tức.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Hủy
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

