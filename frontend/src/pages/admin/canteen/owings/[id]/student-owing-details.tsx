import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useFetchStudentOwingDetails,
  usePayStudentOwing,
} from "@/services/api/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { ArrowLeft, Calendar, User, School } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function StudentOwingDetails() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number.parseInt(id || "0");
  const navigate = useNavigate();
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  const { data: owingDetails, isLoading } =
    useFetchStudentOwingDetails(studentId);
  const { mutate: payOwing, isLoading: isProcessingPayment } =
    usePayStudentOwing();

  const handlePayment = () => {
    const amount = Number.parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    payOwing(
      { studentId, amount },
      {
        onSuccess: () => {
          setPaymentAmount("");
          // toast.success(`Payment of ₵${amount} processed successfully`);
        },
      }
    );
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  const student = owingDetails?.student;
  const owingHistory = owingDetails?.owingHistory || [];

  return (
    <div className="container mx-auto py-10 px-5">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Student Owing Details</h1>
          <p className="text-muted-foreground">
            View and manage payment history for this student
          </p>
        </div>
      </div>

      {student && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Name:</span> {student.name}
                </div>
                <div>
                  <span className="font-semibold">Gender:</span>{" "}
                  {student.gender}
                </div>
                <div>
                  <span className="font-semibold">Age:</span> {student.age}
                </div>
                {student.parentPhone && (
                  <div>
                    <span className="font-semibold">Parent Phone:</span>{" "}
                    {student.parentPhone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="h-5 w-5 mr-2" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Class:</span>{" "}
                  {student.class?.name}
                </div>
                {student.class?.description && (
                  <div>
                    <span className="font-semibold">Description:</span>{" "}
                    {student.class.description}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Owing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Current Owing:</span>{" "}
                  <span className="text-xl font-bold">₵{student.owing}</span>
                </div>
                <div>
                  <span className="font-semibold">Total Records:</span>{" "}
                  {owingHistory.length}
                </div>
                <div className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Amount</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="payment"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Enter amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessingPayment || !paymentAmount}
                      >
                        {isProcessingPayment ? "Processing..." : "Pay"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Owing Before</TableHead>
              <TableHead>Owing After</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owingHistory.length ? (
              owingHistory.map(
                (record: {
                  id: number;
                  date: string;
                  description: string;
                  amountPaid: number | null;
                  owingBefore: number | null;
                  owingAfter: number | null;
                  hasPaid: boolean;
                  isAbsent: boolean;
                }) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.date), "PPP")}
                    </TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>₵{record.amountPaid || 0}</TableCell>
                    <TableCell>₵{record.owingBefore}</TableCell>
                    <TableCell>₵{record.owingAfter}</TableCell>
                    <TableCell>
                      {record.hasPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : record.isAbsent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Absent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unpaid
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No payment history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
