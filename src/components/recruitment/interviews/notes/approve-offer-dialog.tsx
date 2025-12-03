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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApproveOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: number;
  onSuccess: () => void;
}

export function ApproveOfferDialog({
  open,
  onOpenChange,
  applicationId,
  onSuccess,
}: ApproveOfferDialogProps) {
  const [offeredSalary, setOfferedSalary] = useState("");
  const [expectedStartDate, setExpectedStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offeredSalary || !expectedStartDate) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const salary = parseFloat(offeredSalary);
    if (isNaN(salary) || salary <= 0) {
      toast.error("Lương đề xuất phải là số dương");
      return;
    }

    const startDate = new Date(expectedStartDate);
    if (startDate <= new Date()) {
      toast.error("Ngày bắt đầu phải trong tương lai");
      return;
    }

    setLoading(true);
    try {
      const { recruitmentAPI } = await import("@/lib/api");
      await recruitmentAPI.approveApplicationAfterInterview(applicationId, {
        offeredSalary: salary,
        expectedStartDate: expectedStartDate,
      });

      toast.success("Đã duyệt ứng viên và gửi email offer thành công");
      onSuccess();
      onOpenChange(false);
      setOfferedSalary("");
      setExpectedStartDate("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Duyệt ứng viên và tạo Offer</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo offer cho ứng viên sau khi phỏng vấn thành công
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="salary">Lương đề xuất (VND)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="VD: 15000000"
                value={offeredSalary}
                onChange={(e) => setOfferedSalary(e.target.value)}
                required
                min="1"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Ngày bắt đầu làm việc</Label>
              <Input
                id="startDate"
                type="date"
                value={expectedStartDate}
                onChange={(e) => setExpectedStartDate(e.target.value)}
                required
                min={today}
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duyệt và gửi Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

