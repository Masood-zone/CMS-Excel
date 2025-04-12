import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchStudentOwingDetails } from "@/services/api/queries";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { PaymentModal } from "@/components/actions/owings-payment-modal";

export default function OwingStudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = Number.parseInt(id || "0");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [owingSince, setOwingSince] = useState<string | null>(null);

  const {
    data: studentDetails,
    isLoading,
    error,
  } = useFetchStudentOwingDetails(studentId);

  useEffect(() => {
    if (studentDetails?.owingHistory && studentDetails.currentOwing > 0) {
      // Find the earliest record where owing increased
      const earliestOwingRecord = [...studentDetails.owingHistory]
        .filter((record) => record.owingAfter > record.owingBefore)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0];

      if (earliestOwingRecord) {
        setOwingSince(earliestOwingRecord.date);
      }
    }
  }, [studentDetails]);

  const handlePayment = () => {
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  if (isLoading) return <TableSkeleton />;
  if (error || !studentDetails)
    return (
      <Card className="mx-auto max-w-md mt-8">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>Unable to fetch student details. Please try again later.</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );

  const { student, currentOwing, owingHistory } = studentDetails;

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Student Details</h1>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{student.name}</CardTitle>
          <CardDescription>
            {student.age} years old • {student.gender} • {student.class.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5 p-4 border rounded-lg">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Current Owing
              </span>
              <span className="text-2xl font-bold">
                ₵{currentOwing.toFixed(2)}
              </span>
            </div>

            {owingSince && currentOwing > 0 && (
              <div className="flex flex-col space-y-1.5 p-4 border rounded-lg">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Owing Since
                </span>
                <span className="text-2xl font-bold">
                  {format(new Date(owingSince), "PPP")}
                </span>
                <span className="text-sm text-muted-foreground">
                  (
                  {formatDistanceToNow(new Date(owingSince), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </div>
            )}

            <div className="flex flex-col space-y-1.5 p-4 border rounded-lg">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last Updated
              </span>
              <span className="text-2xl font-bold">
                {format(new Date(student.updatedAt), "PPP")}
              </span>
            </div>
          </div>

          {currentOwing > 0 && (
            <Button onClick={handlePayment} className="w-full md:w-auto">
              Process Payment
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Owing History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Owing History</CardTitle>
          <CardDescription>
            Complete history of payments and owing records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {owingHistory && owingHistory.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owingHistory.map(
                    (record: {
                      id: number;
                      date: string;
                      hasPaid: boolean;
                      isAbsent: boolean;
                      amountPaid: number;
                      owingBefore: number;
                      owingAfter: number;
                      description: string;
                    }) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.date), "PPP")}
                        </TableCell>
                        <TableCell>
                          {record.hasPaid ? (
                            <Badge variant="default">Paid</Badge>
                          ) : record.isAbsent ? (
                            <Badge variant="outline">Absent</Badge>
                          ) : (
                            <Badge variant="destructive">Unpaid</Badge>
                          )}
                        </TableCell>
                        <TableCell>₵{record.amountPaid.toFixed(2)}</TableCell>
                        <TableCell>₵{record.owingBefore.toFixed(2)}</TableCell>
                        <TableCell>₵{record.owingAfter.toFixed(2)}</TableCell>
                        <TableCell>{record.description}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No history found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                This student doesn't have any payment or owing history yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {student && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          student={student}
        />
      )}
    </div>
  );
}
