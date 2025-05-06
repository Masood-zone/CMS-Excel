"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useStudentRecordsByClassAndDate,
  useUpdateStudentStatus,
  useGenerateStudentRecords,
  useBulkUpdateStudentStatus,
} from "@/services/api/queries";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, XCircle, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanteenTable } from "@/components/tables/canteen-table";
import type { ColumnDef } from "@tanstack/react-table";
import OwingsPage from "./owings";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";

// Define the CanteenRecord type
interface CanteenRecord {
  id: number;
  studentId?: number;
  student: {
    name: string;
  };
  settingsAmount: number;
  submitedAt: string | Date;
  hasPaid: boolean;
  isAbsent: boolean;
  payedBy?: string | null;
  date?: string;
  submitedBy?: number | null;
  isPrepaid?: boolean;
  classId?: number;
  amount?: number;
}

export default function Canteen() {
  const navigate = useNavigate();
  const { user, assigned_class } = useAuthStore();
  const teacher = user?.user;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<CanteenRecord[]>([]);
  const [selectedRows, setSelectedRows] = useState<CanteenRecord[]>([]);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<"paid" | "unpaid" | null>(null);
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false);
  const [markAllAction, setMarkAllAction] = useState<"paid" | "unpaid" | null>(
    null
  );

  const classId = assigned_class?.id ?? 0;
  const formattedDate = selectedDate.toISOString().split("T")[0];
  const { data: studentRecords, isLoading: recordsLoading } =
    useStudentRecordsByClassAndDate(classId, formattedDate);
  const { mutate: updateStatus, isLoading: updatingLoader } =
    useUpdateStudentStatus();
  const { mutate: generateRecords, isLoading: isGenerating } =
    useGenerateStudentRecords();
  const { mutate: bulkUpdateStatus, isLoading: bulkUpdatingLoader } =
    useBulkUpdateStudentStatus();

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
        date: selectedDate?.toISOString().split("T")[0] ?? "",
        payedBy: record.payedBy ? Number(record.payedBy) : null,
        isPrepaid: record.isPrepaid ?? false,
        submitedBy:
          typeof record.submitedBy === "number" ? record.submitedBy : 0,
        classId: record.classId ?? classId,
      };
      await updateStatus(updatedRecord);
      setRecords((prevRecords) =>
        prevRecords.map((r) =>
          r.id === record.id
            ? {
                ...updatedRecord,
                payedBy: updatedRecord.payedBy
                  ? updatedRecord.payedBy.toString()
                  : null,
              }
            : r
        )
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
        submitedBy: teacher?.id ?? 0,
        date: selectedDate?.toISOString().split("T")[0] ?? "",
        amount: record.amount,
        submitedAt: record.submitedAt,
        payedBy: record.payedBy ? Number(record.payedBy) : null,
        isPrepaid: record.isPrepaid,
        settingsAmount: record.settingsAmount,
        classId: classId,
        student: record.student,
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

      if (studentsToUpdate.length === 0) {
        toast.info("No students to update");
        setShowMarkAllDialog(false);
        return;
      }

      const updatedRecords = studentsToUpdate.map((record) => ({
        ...record,
        hasPaid: action === "paid",
        isAbsent: false,
        submitedBy: teacher?.id ?? 0,
        date: selectedDate?.toISOString().split("T")[0] ?? "",
        amount: record.amount,
        submitedAt: record.submitedAt,
        payedBy: record.payedBy ? Number(record.payedBy) : null,
        isPrepaid: record.isPrepaid,
        settingsAmount: record.settingsAmount,
        classId: classId,
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

  const openBulkActionDialog = (action: "paid" | "unpaid") => {
    setBulkAction(action);
    setShowBulkActionDialog(true);
  };

  const handleGenerateRecords = () => {
    generateRecords({ classId, date: selectedDate.toISOString() });
  };

  const handleRowSelectionChange = (rows: CanteenRecord[]) => {
    setSelectedRows(rows as CanteenRecord[]);
  };

  const columns: ColumnDef<CanteenRecord>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="px-1">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.toggleSelected(e.target.checked);
            }}
            aria-label="Select row"
            disabled={row.original.isAbsent}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "student.name",
      header: "Student Name",
    },
    {
      accessorKey: "settingsAmount",
      header: "Amount",
      cell: ({ row }) => `₵${row.original.settingsAmount.toFixed(2)}`,
    },
    {
      accessorKey: "submitedAt",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.submitedAt), "PPp"),
    },
    {
      accessorKey: "hasPaid",
      header: "Payment Status",
      cell: ({ row }) => (row.original.hasPaid ? "Paid" : "Unpaid"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant={record.hasPaid ? "destructive" : "default"}
              onClick={() =>
                handleUpdateStatus(record, {
                  hasPaid: !record.hasPaid,
                  isAbsent: false,
                })
              }
              disabled={updatingLoader}
              size="sm"
            >
              {record.hasPaid ? "Mark as Unpaid" : "Mark as Paid"}
            </Button>
            {!record.hasPaid && !record.isAbsent && (
              <Button
                variant="outline"
                onClick={() =>
                  handleUpdateStatus(record, { hasPaid: false, isAbsent: true })
                }
                disabled={updatingLoader}
                size="sm"
              >
                Mark as Absent
              </Button>
            )}
            {record.isAbsent && (
              <Button
                variant="outline"
                onClick={() =>
                  handleUpdateStatus(record, {
                    hasPaid: false,
                    isAbsent: false,
                  })
                }
                disabled={updatingLoader}
                size="sm"
              >
                Mark as Present
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <section className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Hello, {teacher?.name}</h1>
          <p className="text-xl py-2">{assigned_class?.name}</p>
          <p className="text-base">Record canteen for {assigned_class?.name}</p>
        </div>
        <div className="space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Submit canteen records</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will submit the canteen
                  records for {teacher?.name} to the admin for approval.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => navigate("/teacher/canteen/submit")}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-muted-foreground">
            Filter students records by date:
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
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
          <Button onClick={handleGenerateRecords} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Records"}
          </Button>
        </div>

        {/* Bulk action buttons */}
        <div className="flex items-center space-x-2 mb-4">
          {/* Mark All buttons */}
          <Button
            onClick={() => openMarkAllDialog("paid")}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark All as Paid
          </Button>
          <Button
            onClick={() => openMarkAllDialog("unpaid")}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Mark All as Unpaid
          </Button>

          {/* Selected rows buttons */}
          {selectedRows.length > 0 && (
            <>
              <Button
                onClick={() => openBulkActionDialog("paid")}
                disabled={bulkUpdatingLoader}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark {selectedRows.length} as Paid
              </Button>
              <Button
                onClick={() => openBulkActionDialog("unpaid")}
                disabled={bulkUpdatingLoader}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark {selectedRows.length} as Unpaid
              </Button>
            </>
          )}
        </div>

        {selectedRows.length > 0 && (
          <div className="bg-muted/50 p-3 rounded-md mb-4 flex items-center justify-between">
            <p>
              <span className="font-medium">{selectedRows.length}</span>{" "}
              students selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows([])}
            >
              Clear selection
            </Button>
          </div>
        )}

        <Tabs defaultValue="canteen" className="w-full">
          <TabsList>
            <TabsTrigger value="canteen">Canteen</TabsTrigger>
            <TabsTrigger value="owings">Owings</TabsTrigger>
          </TabsList>

          <TabsContent value="canteen">
            {recordsLoading ? (
              <TableSkeleton />
            ) : (
              <CanteenTable
                columns={columns}
                data={records || []}
                onRowSelectionChange={handleRowSelectionChange}
              />
            )}
          </TabsContent>

          <TabsContent value="owings">
            <OwingsPage />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bulk action confirmation dialog */}
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
