"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  useFetchClasses,
  useStudentRecordsByClassAndDate,
  useUpdateStudentStatus,
  useSubmitTeacherRecord,
  useGenerateStudentRecords,
  useBulkUpdateStudentStatus,
} from "@/services/api/queries";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, CheckCircle, XCircle, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanteenTable } from "@/components/tables/canteen-table";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { columns } from "./columns";
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
import type { ColumnDef } from "@tanstack/react-table";

// Define the Class type
interface Class {
  id: number;
  name: string;
  supervisorId: number;
}

export default function SetupCanteen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [records, setRecords] = useState<CanteenRecord[]>([]);
  const [selectedRows, setSelectedRows] = useState<CanteenRecord[]>([]);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<"paid" | "unpaid" | null>(null);
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false);
  const [markAllAction, setMarkAllAction] = useState<"paid" | "unpaid" | null>(
    null
  );

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const { data: classes, isLoading: classesLoading } = useFetchClasses();
  const { data: studentRecords, isLoading: recordsLoading } =
    useStudentRecordsByClassAndDate(
      Number.parseInt(selectedClassId),
      formattedDate
    );
  const { mutate: generateRecords, isLoading: isGenerating } =
    useGenerateStudentRecords();
  const { mutate: updateStatus, isLoading: updatingLoader } =
    useUpdateStudentStatus();
  const { mutate: bulkUpdateStatus, isLoading: bulkUpdatingLoader } =
    useBulkUpdateStudentStatus();
  const { mutate: submitRecord, isLoading: submittingRecord } =
    useSubmitTeacherRecord();
  const classSupervisorId = classes?.find(
    (classItem: Class) => classItem.id === Number.parseInt(selectedClassId)
  )?.supervisorId;

  useEffect(() => {
    if (studentRecords) {
      setRecords(studentRecords);
    }
  }, [studentRecords]);

  const handleUpdateStatus = async (
    record: CanteenRecord,
    newStatus: { hasPaid: boolean; isAbsent: boolean }
  ) => {
    try {
      const updatedRecord = {
        ...record,
        ...newStatus,
        submitedBy: classSupervisorId ?? 0,
        classId: Number.parseInt(selectedClassId),
        isPrepaid: record.isPrepaid ?? false,
        payedBy: record.payedBy ?? null,
        date: selectedDate?.toISOString().split("T")[0] ?? "",
      };
      await updateStatus(updatedRecord);
      setRecords((prevRecords) =>
        prevRecords.map((r) => (r.id === record.id ? updatedRecord : r))
      );
      toast.success("Student status updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student status");
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!selectedRows.length || !bulkAction) return;

    try {
      const updatedRecords = selectedRows.map((record) => ({
        ...record,
        hasPaid: bulkAction === "paid",
        isAbsent: false,
        submitedBy: classSupervisorId ?? 0,
        date: selectedDate?.toISOString().split("T")[0] ?? "",
        amount: record.amount,
        submitedAt: record.submitedAt,
        payedBy: record.payedBy,
        isPrepaid: record.isPrepaid,
        settingsAmount: record.settingsAmount,
        classId: record.classId, // Ensure classId is included
        student: record.student, // Ensure student is included
      }));

      await bulkUpdateStatus(updatedRecords);

      // Update local state
      setRecords((prevRecords) =>
        prevRecords.map((record) => {
          const updatedRecord = selectedRows.find((r) => r.id === record.id);
          if (updatedRecord) {
            return {
              ...record,
              hasPaid: bulkAction === "paid",
              isAbsent: false,
            };
          }
          return record;
        })
      );

      toast.success(
        `${selectedRows.length} students marked as ${
          bulkAction === "paid" ? "paid" : "unpaid"
        }`
      );
      setSelectedRows([]);
      setShowBulkActionDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student statuses");
    }
  };

  const handleMarkAllStudents = async (action: "paid" | "unpaid") => {
    try {
      // Filter out absent students for bulk update
      const studentsToUpdate = records.filter((record) => !record.isAbsent);

      const updatedRecords = studentsToUpdate.map((record) => ({
        id: record.id,
        hasPaid: action === "paid",
        isAbsent: false,
        submitedBy: classSupervisorId ?? 0,
        date: selectedDate?.toISOString().split("T")[0] ?? "",
        amount: record.amount,
        submitedAt: record.submitedAt,
        payedBy: record.payedBy,
        isPrepaid: record.isPrepaid,
        settingsAmount: record.settingsAmount,
      }));

      await bulkUpdateStatus(updatedRecords);

      // Update local state
      setRecords((prevRecords) =>
        prevRecords.map((record) => {
          if (!record.isAbsent) {
            return {
              ...record,
              hasPaid: action === "paid",
            };
          }
          return record;
        })
      );

      toast.success(
        `All students marked as ${action === "paid" ? "paid" : "unpaid"}`
      );
      setShowMarkAllDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student statuses");
    }
  };

  const openMarkAllDialog = (action: "paid" | "unpaid") => {
    setMarkAllAction(action);
    setShowMarkAllDialog(true);
  };

  const handleGenerateRecords = () => {
    generateRecords({
      classId: Number.parseInt(selectedClassId),
      date: selectedDate.toISOString(),
    });
  };

  const handleSubmitCanteen = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class before submitting");
      return;
    }

    const payload = {
      classId: Number.parseInt(selectedClassId),
      date: formattedDate,
      unpaidStudents: records
        .filter((r) => !r.hasPaid && !r.isAbsent)
        .map((r) => ({
          id: r.id,
          amount: r.settingsAmount,
          paidBy: r.payedBy?.toString() || "",
          hasPaid: false,
          date: formattedDate,
        })),
      paidStudents: records
        .filter((r) => r.hasPaid)
        .map((r) => ({
          id: r.id,
          amount: r.settingsAmount,
          paidBy: r.payedBy?.toString() || "",
          hasPaid: true,
          date: formattedDate,
        })),
      absentStudents: records
        .filter((r) => r.isAbsent)
        .map((r) => ({
          id: r.id,
          amount_owing: r.settingsAmount,
          paidBy: r.payedBy?.toString() || "",
          hasPaid: false,
          date: formattedDate,
        })),
      submittedBy: classSupervisorId,
    };

    try {
      await submitRecord(payload);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit canteen records");
    }
  };

  const handleRowSelectionChange = (rows: CanteenRecord[]) => {
    setSelectedRows(rows);
  };

  const openBulkActionDialog = (action: "paid" | "unpaid") => {
    setBulkAction(action);
    setShowBulkActionDialog(true);
  };
  const typedColumns: ColumnDef<CanteenRecord, unknown>[] = columns(
    handleUpdateStatus,
    updatingLoader,
    () => {} // This should be your function that handles row selection changes
  ) as ColumnDef<CanteenRecord, unknown>[];

  return (
    <section className="container mx-auto px-2 sm:px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
            {/* Mark All buttons */}
            <Button
              onClick={() => openMarkAllDialog("paid")}
              className="bg-green-600 hover:bg-green-700 text-xs sm:text-base"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark All as Paid
            </Button>
            <Button
              onClick={() => openMarkAllDialog("unpaid")}
              variant="destructive"
              className="text-xs sm:text-base"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All as Unpaid
            </Button>
            {selectedRows.length > 0 && (
              <>
                <Button
                  onClick={() => openBulkActionDialog("paid")}
                  disabled={bulkUpdatingLoader}
                  className="bg-green-600 hover:bg-green-700 text-xs sm:text-base"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark {selectedRows.length} as Paid
                </Button>
                <Button
                  onClick={() => openBulkActionDialog("unpaid")}
                  disabled={bulkUpdatingLoader}
                  variant="destructive"
                  className="text-xs sm:text-base"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark {selectedRows.length} as Unpaid
                </Button>
              </>
            )}
          </div>
        </div>
        <Button
          onClick={handleSubmitCanteen}
          disabled={!selectedClassId || submittingRecord}
          className="mt-2 sm:mt-0 w-full sm:w-auto text-xs sm:text-base"
        >
          {submittingRecord ? "Submitting..." : "Submit Canteen Records"}
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4 mb-6">
        <Select onValueChange={setSelectedClassId} value={selectedClassId}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((classItem: Class) => (
              <SelectItem key={classItem.id} value={classItem.id.toString()}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal text-xs sm:text-base",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleGenerateRecords}
          disabled={isGenerating}
          className="w-full sm:w-auto text-xs sm:text-base"
        >
          {isGenerating ? "Generating..." : "Generate Records"}
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <div className="bg-muted/50 p-3 rounded-md mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p>
            <span className="font-medium">{selectedRows.length}</span> students
            selected
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRows([])}>
            Clear selection
          </Button>
        </div>
      )}

      {classesLoading || recordsLoading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <CanteenTable
            columns={typedColumns}
            data={records}
            onRowSelectionChange={handleRowSelectionChange}
          />
        </div>
      )}

      <AlertDialog
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {selectedRows.length} students as{" "}
              {bulkAction === "paid" ? "paid" : "unpaid"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkUpdateStatus}
              className={
                bulkAction === "paid" ? "bg-green-600 hover:bg-green-700" : ""
              }
            >
              {bulkUpdatingLoader
                ? "Processing..."
                : `Mark as ${bulkAction === "paid" ? "Paid" : "Unpaid"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Mark All confirmation dialog */}
      <AlertDialog open={showMarkAllDialog} onOpenChange={setShowMarkAllDialog}>
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
              onClick={() =>
                markAllAction && handleMarkAllStudents(markAllAction)
              }
              className={
                markAllAction === "paid"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {bulkUpdatingLoader
                ? "Processing..."
                : `Mark All as ${markAllAction === "paid" ? "Paid" : "Unpaid"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
