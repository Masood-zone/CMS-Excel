"use client";

import { ProfessionalAnalyticsCard } from "@/components/shared/cards/analytic-cards";
import { CardsSkeleton } from "@/components/shared/page-loader/loaders";
import {
  useFetchRecordsAmount,
  useAllTermsAnalytics,
  useTeacherAnalytics,
} from "@/services/api/queries";
import { useAuthStore } from "@/store/authStore";
import { CurrencyIcon, UserCheck, Users, UserX } from "lucide-react";
import React, { useState } from "react";
import { TermSelector } from "@/components/shared/term-selector";
import { TermWarning } from "@/components/shared/term-warning";

interface TermAnalytics {
  term: {
    id: number;
    name: string;
    year: number;
    isActive: boolean;
  };
}

export default function TeacherHome() {
  const { user, assigned_class } = useAuthStore();
  const { data: price, error: canteenPriceError } = useFetchRecordsAmount();
  // Fetch all terms for the dropdown
  const { data: allTermsRaw } = useAllTermsAnalytics();
  const allTerms: TermAnalytics[] = React.useMemo(
    () => (Array.isArray(allTermsRaw) ? (allTermsRaw as TermAnalytics[]) : []),
    [allTermsRaw]
  );
  // Track selected termId (default to active term if available)
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(
    () => {
      if (allTerms.length > 0) {
        const active = allTerms.find((t) => t.term?.isActive);
        return active?.term?.id;
      }
      return undefined;
    }
  );
  // Fetch analytics for selected term
  const {
    data: analytics,
    isLoading,
    error,
  } = useTeacherAnalytics(assigned_class?.id ?? 0, selectedTermId);

  // Update selectedTermId when allTerms loads and no term is selected
  React.useEffect(() => {
    if (!selectedTermId && allTerms.length > 0) {
      const active = allTerms.find((t) => t.term?.isActive);
      setSelectedTermId(active?.term?.id);
    }
  }, [allTerms, selectedTermId]);

  return (
    <>
      {/* Welcome message */}
      <div className="flex items-center md:flex-row flex-col justify-between w-full">
        <div className="space-y-2 p-4">
          <h1 className="text-2xl font-bold">Welcome, {user?.user?.name}</h1>
          <p className="">
            You are in charge of{" "}
            <span className="font-bold">{assigned_class?.name}</span> class.
          </p>
        </div>
        <div className="">
          <h2 className="w-full">
            Canteen Price
            {Boolean(canteenPriceError) && (
              <p className="text-red-500">Error fetching canteen price</p>
            )}
            <span className="text-2xl font-bold text-primary text-center px-2">
              Gh₵{price?.data?.value || 0}
            </span>
          </h2>
          <p>This is the current price of the canteen.</p>
        </div>
      </div>
      {/* Term Selector */}
      <div className="space-y-4">
        <TermWarning showNavigateButton={false} />
        <TermSelector
          selectedTermId={selectedTermId}
          onTermChange={setSelectedTermId}
          className="mb-4"
        />
      </div>
      {/* Analytics */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {isLoading ? (
          <CardsSkeleton count={4} />
        ) : error ? (
          <div className="">
            <CardsSkeleton count={3} />
            <p className="text-center text-red-500">Error fetching analytics</p>
          </div>
        ) : (
          <div className="grid auto-rows-min gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ProfessionalAnalyticsCard
              title="Total Amount"
              value={`₵${analytics?.totalAmount || 0}`}
              icon={CurrencyIcon}
              notice="Total expected amount from all students"
              variant="blue"
            />
            <ProfessionalAnalyticsCard
              title="Total Students"
              value={analytics?.totalStudents || 0}
              icon={Users}
              notice="Total number of students in the class"
              variant="purple"
            />
            <ProfessionalAnalyticsCard
              title="Paid Students"
              value={analytics?.paidStudents?.count || 0}
              secondaryValue={`₵${analytics?.paidStudents?.amount || 0}`}
              icon={UserCheck}
              notice="Number of paid students and total amount paid"
              variant="green"
            />
            <ProfessionalAnalyticsCard
              title="Unpaid Students"
              value={analytics?.unpaidStudents?.count || 0}
              secondaryValue={`₵${analytics?.unpaidStudents?.amount || 0}`}
              icon={UserX}
              notice="Number of unpaid students and total amount due"
              variant="amber"
            />
          </div>
        )}
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
