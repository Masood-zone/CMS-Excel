import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRowsCount: number;
  bulkAction: "paid" | "unpaid" | null;
  onConfirm: () => void;
  loading: boolean;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  selectedRowsCount,
  bulkAction,
  onConfirm,
  loading,
}: BulkActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark {selectedRowsCount} students as{" "}
            {bulkAction === "paid" ? "paid" : "unpaid"}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              bulkAction === "paid" ? "bg-primary hover:bg-foreground" : ""
            }
          >
            {loading
              ? "Processing..."
              : `Mark as ${bulkAction === "paid" ? "Paid" : "Unpaid"}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface MarkAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markAllAction: "paid" | "unpaid" | null;
  onConfirm: () => void;
  loading: boolean;
}

export function MarkAllDialog({
  open,
  onOpenChange,
  markAllAction,
  onConfirm,
  loading,
}: MarkAllDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Mark All</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark ALL students as{" "}
            {markAllAction === "paid" ? "paid" : "unpaid"}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              markAllAction === "paid" ? "bg-primary hover:bg-foreground" : ""
            }
          >
            {loading
              ? "Processing..."
              : `Mark All as ${markAllAction === "paid" ? "Paid" : "Unpaid"}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
