import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetchDashboardSummary } from "@/services/api/queries";
import { Users, CreditCard, Receipt, Loader2 } from "lucide-react";

export default function OverallTotals() {
  const { data, error, isLoading } = useFetchDashboardSummary();

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;
  if (error) return <div>Error fetching dashboard summary</div>;

  const summary = data?.summary;

  return (
    <section className="p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              Ghc{summary?.totalAmount || 0}
            </div>
            <p className="text-base pt-2 text-muted-foreground">
              From {summary?.totalStudents || 0} students
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalStudents || 0}
            </div>
            <p className="text-base pt-2 text-muted-foreground">
              <span className="text-primary">
                {summary?.paidStudentsCount || 0} paid,{" "}
              </span>
              <span className="text-destructive">
                {summary?.unpaidStudentsCount || 0} unpaid
              </span>
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              Ghc{summary?.totalPaid || 0}
            </div>
            <p className="text-base pt-2 text-muted-foreground">
              From {summary?.paidStudentsCount || 0} students
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -Ghc{summary?.totalUnpaid || 0}
            </div>
            <p className="text-base pt-2 text-muted-foreground">
              Owings: {summary?.unpaidStudentsCount || 0} students
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
