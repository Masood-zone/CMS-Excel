import { AnalyticsCard } from "@/components/shared/cards/analytic-cards";
import { CardsSkeleton } from "@/components/shared/page-loader/loaders";
import { useAdminDashboardAnalytics } from "@/services/api/queries";
import {
  BookOpen,
  CurrencyIcon,
  School,
  Users,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const { data: analytics, isLoading, error } = useAdminDashboardAnalytics();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-semibold py-3">Overview</h1>
        {isLoading ? (
          <CardsSkeleton count={6} />
        ) : error ? (
          <div className="">
            <CardsSkeleton count={4} />
            <p className="text-center text-red-500">Error fetching analytics</p>
          </div>
        ) : (
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard
              title="Total Teachers"
              value={analytics?.totalTeachers || 0}
              icon={<Users className="size-6 text-blue-500" />}
              notice="Total number of teachers in the school"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer"
              onClick={() => navigate("/admin/teachers")}
            />
            <AnalyticsCard
              title="Total Students"
              value={analytics?.totalStudents || 0}
              icon={<School className="size-6 text-emerald-500" />}
              notice="Total number of students in the school"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 cursor-pointer"
              onClick={() => navigate("/admin/students")}
            />
            <AnalyticsCard
              title="Total Collections"
              value={`₵${analytics?.totalCollections || 0}`}
              icon={<CurrencyIcon className="size-6 text-amber-500" />}
              notice="Total expected amount from all students"
              className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 cursor-pointer"
              onClick={() => navigate("/admin/canteen-records")}
            />
            <AnalyticsCard
              title="Total Classes"
              value={analytics?.totalClasses || 0}
              icon={<BookOpen className="size-6 text-purple-500" />}
              notice="Total number of classes in the school"
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer"
              onClick={() => navigate("/admin/classes")}
            />
            <AnalyticsCard
              title="Expenses"
              value={`₵${analytics?.expenses || 0}`}
              icon={<ReceiptText className="size-6 text-red-500" />}
              notice="Total number of expense records"
              className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer"
              onClick={() => navigate("/admin/expenses")}
            />
            <AnalyticsCard
              title="Total Expenses"
              value={`₵${analytics?.totalExpenses || 0}`}
              icon={<Wallet className="size-6 text-fuchsia-500" />}
              notice="Total amount spent on expenses"
              className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 border-fuchsia-200 cursor-pointer"
              onClick={() => navigate("/admin/expenses")}
            />
          </div>
        )}
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
