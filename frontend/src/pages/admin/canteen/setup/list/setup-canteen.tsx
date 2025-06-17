"use client";

import { useState, useEffect } from "react";
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
import type { ColumnDef } from "@tanstack/react-table";
import {
  useBulkUpdateStudentStatus,
  useFetchClasses,
  useGenerateStudentRecords,
  useStudentRecordsByClassAndDate,
  useUpdateStudentStatus,
} from "@/services/api/queries";
import { BulkActionDialog, MarkAllDialog } from "./setup-canteen-alerts";

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
    if (records.length > 0) {
      setRecords((prev) => prev.map((r) => ({ ...r, isSubmitted: true })));
    }
  }, [records.length]);

  // When generating records, set lockout for current class/date
  const handleGenerateRecords = async () => {
    if (!selectedClassId) return;
    await generateRecords({
      classId: Number.parseInt(selectedClassId),
      date: selectedDate.toISOString(),
    });
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
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark All as Paid
            </Button>
            <Button
              onClick={() => openMarkAllDialog("unpaid")}
              variant="destructive"
              className="whitespace-nowrap"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All as Unpaid
            </Button>
            {selectedRows.length > 0 && (
              <>
                <Button
                  onClick={() => openBulkActionDialog("paid")}
                  disabled={bulkUpdatingLoader}
                  className="bg-primary hover:bg-foreground whitespace-nowrap"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark {selectedRows.length} as Paid
                </Button>
                <Button
                  onClick={() => openBulkActionDialog("unpaid")}
                  disabled={bulkUpdatingLoader}
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
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleGenerateRecords}
          disabled={isGenerating}
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
      {/* Mark All confirmation dialog */}
      <BulkActionDialog
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
        selectedRowsCount={selectedRows.length}
        bulkAction={bulkAction}
        onConfirm={handleBulkUpdateStatus}
        loading={bulkUpdatingLoader}
      />
      <MarkAllDialog
        open={showMarkAllDialog}
        onOpenChange={setShowMarkAllDialog}
        markAllAction={markAllAction}
        onConfirm={() => markAllAction && handleMarkAllStudents(markAllAction)}
        loading={bulkUpdatingLoader}
      />
    </section>
  );
}
