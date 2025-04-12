import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayStudentOwing } from "@/services/api/queries";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export function PaymentModal({ isOpen, onClose, student }: PaymentModalProps) {
  const [amount, setAmount] = useState<string>(
    student?.owing?.toString() || "0"
  );
  const { mutate: payOwing, isLoading } = usePayStudentOwing();

  const handlePayment = () => {
    const paymentAmount = Number.parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return;
    }

    payOwing(
      { studentId: Number(student.id), amount: paymentAmount },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Enter payment amount for {student.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-owing" className="text-right">
              Current Owing
            </Label>
            <Input
              id="current-owing"
              value={`₵${student?.owing?.toFixed(2)}`}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-amount" className="text-right">
              Payment Amount
            </Label>
            <Input
              id="payment-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              max={student?.owing?.toString()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? "Processing..." : "Process Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
