import {
  useDeleteResource,
  useFetchExpenses,
  useFetchRecords,
} from "@/services/api/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { expensesColumn } from "./columns";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { ExpensesDataTable } from "@/components/tables/expenses-table";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const PERIOD_OPTIONS = [
  { label: "All", value: "all" },
  { label: "This Year", value: "year" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Last 6 Months", value: "last6months" },
  { label: "Last 3 Months", value: "last3months" },
  { label: "Custom Range", value: "custom" },
];

export default function ExpensesTable({
  selectedTermId,
}: {
  selectedTermId?: number;
}) {
  const [period, setPeriod] = useState("all");
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Helper for quick-select ranges
  const selectQuickRange = (months: number) => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    setCustomRange({ from, to });
    setCalendarOpen(false);
  };

  // Build filter for query
  let filter: { period?: string; from?: string; to?: string } = {};
  if (
    period === "custom" &&
    customRange &&
    customRange.from &&
    customRange.to
  ) {
    filter = {
      from: customRange.from.toISOString().split("T")[0],
      to: customRange.to.toISOString().split("T")[0],
    };
  } else if (period === "last6months") {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    filter = {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  } else if (period === "last3months") {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    filter = {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  } else if (period !== "all") {
    filter = { period };
  }

  const {
    data: expenses,
    isLoading,
    error,
  } = useFetchExpenses(selectedTermId, filter);
  const { data: overall, error: recordsError } = useFetchRecords();

  useEffect(() => {
    if (recordsError) {
      console.log("Error fetching records");
    }
  }, [recordsError]);

  const calculateExpensesTotal = useMemo(() => {
    return expenses?.reduce(
      (sum: number, expense: Expense) => sum + expense.amount,
      0
    );
  }, [expenses]);
  const totalCollection = useMemo(() => {
    return overall?.reduce(
      (sum: number, student: Student) => sum + (student?.settingsAmount ?? 0),
      0
    );
  }, [overall]);

  const { mutateAsync: deleteExpense } = useDeleteResource(
    "expenses",
    "expenses"
  );

  if (isLoading) return <TableSkeleton />;
  if (error) return <div>Error fetching expenses</div>;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center w-full">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {period === "custom" && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[220px] justify-start text-left font-normal"
              >
                {customRange && customRange.from && customRange.to
                  ? `${format(customRange.from, "PPP")} - ${format(
                      customRange.to,
                      "PPP"
                    )}`
                  : "Pick a date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-2" align="start">
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => selectQuickRange(6)}
                >
                  Last 6 Months
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => selectQuickRange(3)}
                >
                  Last 3 Months
                </Button>
              </div>
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(range) => {
                  if (!range || !("from" in range)) {
                    setCustomRange({ from: undefined, to: undefined });
                    return;
                  }
                  // Defensive: only set if at least one is defined
                  setCustomRange({
                    from: range.from ?? undefined,
                    to: range.to ?? undefined,
                  });
                  // Only close if both are defined
                  if (range.from && range.to) setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <ExpensesDataTable
        data={expenses || []}
        columns={expensesColumn(deleteExpense)}
        searchField="description"
        calculateTotal={calculateExpensesTotal}
        overallTotal={totalCollection}
      />
    </>
  );
}
