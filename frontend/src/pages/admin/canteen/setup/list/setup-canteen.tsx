"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
import {
  useBulkUpdateStudentStatus,
  useFetchClasses,
  useFetchClassPrepaymentStatus,
  useGenerateStudentRecords,
  useStudentRecordsByClassAndDate,
  useSubmitTeacherRecord,
  useUpdateStudentStatus,
} from "@/services/api/queries";
// import { useFetchClasses } from "@/services/api/classes/classes.queries";
// import {
//   useBulkUpdateStudentStatus,
//   useGenerateStudentRecords,
//   useStudentRecordsByClassAndDate,
//   useSubmitTeacherRecord,
//   useUpdateStudentStatus,
// } from "@/services/api/records/records.queries";
// import { useFetchClassPrepaymentStatus } from "@/services/api/prepayments/prepayments.queries";

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
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");
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

  const { data: prepaymentStatus } = useFetchClassPrepaymentStatus(
    Number.parseInt(selectedClassId),
    formattedDate
  );

  useEffect(() => {
    if (studentRecords && prepaymentStatus) {
      const updatedRecords = studentRecords.map((record: CanteenRecord) => {
        // Check if this student has an active prepayment for today
        const hasActivePrepayment = prepaymentStatus.some(
          (status) => status.studentId === record.payedBy
        );

        // If student has active prepayment, mark as paid and prepaid
        if (hasActivePrepayment) {
          return {
            ...record,
            hasPaid: true,
            isPrepaid: true,
          };
        }

        return record;
      });

      setRecords(updatedRecords);
    } else if (studentRecords) {
      setRecords(studentRecords);
    }
  }, [studentRecords, prepaymentStatus]);

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

  // Helper to get the submission key for localStorage
  const getSubmissionKey = (classId: string, date: string) =>
    `canteen_submitted_${classId}_${date}`;

  // Helper to check if the current class/date is submitted
  const checkIsSubmitted = useCallback((classId: string, date: string) => {
    if (!classId || !date) return false;
    return localStorage.getItem(getSubmissionKey(classId, date)) === "true";
  }, []);

  // State for per-class/date submission
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Update isSubmitted whenever class/date changes
  useEffect(() => {
    setIsSubmitted(checkIsSubmitted(selectedClassId, formattedDate));
  }, [selectedClassId, formattedDate, checkIsSubmitted]);

  // When submitting, set lockout for current class/date
  const handleSubmitCanteen = async () => {
    if (!selectedClassId) return;

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
      // Mark as submitted for today
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("canteen_last_submitted", today);
      localStorage.setItem(
        getSubmissionKey(selectedClassId, formattedDate),
        "true"
      );
      setIsSubmitted(true);
      const key = getSubmissionKey(selectedClassId, formattedDate);
      localStorage.setItem(key, "1");
      setIsSubmittedToday(true);
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

  // When records are loaded, mark them as submitted if today is submitted
  useEffect(() => {
    if (isSubmittedToday && records.length > 0) {
      setRecords((prev) => prev.map((r) => ({ ...r, isSubmitted: true })));
    }
  }, [isSubmittedToday, records.length]);

  // Helper: get lockout key for current class/date
  const getLockoutKey = (classId: string, date: string) =>
    `canteen_submitted_${classId}_${date}`;

  // Check lockout for selected class/date
  useEffect(() => {
    if (!selectedClassId) return;
    const key = getLockoutKey(selectedClassId, formattedDate);
    setIsSubmittedToday(!!localStorage.getItem(key));
  }, [selectedClassId, formattedDate]);

  // When generating records, set lockout for current class/date
  const handleGenerateRecords = async () => {
    if (!selectedClassId) return;
    await generateRecords({
      classId: Number.parseInt(selectedClassId),
      date: selectedDate.toISOString(),
    });
    const key = getLockoutKey(selectedClassId, formattedDate);
    localStorage.setItem(key, "1");
    setIsSubmittedToday(true);
  };

  // Date picker: only allow today and past weekdays (no weekends, no future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6 w-full overflow-x-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full overflow-x-auto">
          {/* Mark All buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              onClick={() => openMarkAllDialog("paid")}
              className="bg-primary hover:bg-foreground whitespace-nowrap"
              disabled={isSubmitted}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark All as Paid
            </Button>
            <Button
              onClick={() => openMarkAllDialog("unpaid")}
              variant="destructive"
              className="whitespace-nowrap"
              disabled={isSubmitted}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All as Unpaid
            </Button>
            {selectedRows.length > 0 && (
              <>
                <Button
                  onClick={() => openBulkActionDialog("paid")}
                  disabled={bulkUpdatingLoader || isSubmitted}
                  className="bg-primary hover:bg-foreground whitespace-nowrap"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark {selectedRows.length} as Paid
                </Button>
                <Button
                  onClick={() => openBulkActionDialog("unpaid")}
                  disabled={bulkUpdatingLoader || isSubmitted}
                  variant="destructive"
                  className="whitespace-nowrap"
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
          disabled={!selectedClassId || submittingRecord || isSubmitted}
          className="w-full md:w-auto"
        >
          {submittingRecord ? "Submitting..." : "Submit Canteen Records"}
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 w-full overflow-x-auto">
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
                "w-full sm:w-[240px] justify-start text-left font-normal",
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
              disabled={[
                // Disable weekends
                { dayOfWeek: [0, 6] },
                // Disable all future dates
                { after: new Date() },
              ]}
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleGenerateRecords}
          disabled={isGenerating || isSubmittedToday}
          className="w-full sm:w-auto"
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

      <div className="w-full overflow-x-auto">
        {classesLoading || recordsLoading ? (
          <TableSkeleton />
        ) : (
          <CanteenTable
            columns={typedColumns}
            data={records}
            onRowSelectionChange={handleRowSelectionChange}
          />
        )}
      </div>

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
                bulkAction === "paid" ? "bg-primary hover:bg-foreground" : ""
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
                markAllAction === "paid" ? "bg-primary hover:bg-foreground" : ""
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
