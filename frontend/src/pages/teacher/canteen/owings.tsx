import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFetchTeacherOwingStudents } from "@/services/api/queries";
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
import { Input } from "@/components/ui/input";
import { PaymentModal } from "@/components/actions/owings-payment-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OwingsPage() {
  const { user } = useAuthStore();
  const teacherId = user?.user?.id || 0;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const {
    data: owingData,
    isLoading,
    error,
  } = useFetchTeacherOwingStudents(teacherId);

  const handlePayment = (student: Student) => {
    setSelectedStudent(student);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedStudent(null);
  };

  const filteredStudents = owingData?.owingStudents?.filter(
    (student: Student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <TableSkeleton />;
  if (error)
    return (
      <Card className="mx-auto max-w-md ">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>Unable to fetch owing students. Please try again later.</p>
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

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Student Owings
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Manage outstanding payments for {owingData?.class?.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owing</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">₵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{owingData?.totalOwing?.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding balance across all students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Students Owing
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owingData?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total number of students with outstanding balances
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Owing</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">₵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵
              {owingData?.count
                ? (owingData.totalOwing / owingData.count).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average amount owed per student
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            View and manage students with outstanding balances
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents && filteredStudents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Owing Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student: Student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.age}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (student?.owing ?? 0) > 10
                              ? "destructive"
                              : "secondary"
                          }
                          className="font-semibold"
                        >
                          ₵{student?.owing?.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handlePayment(student)}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <span className="h-4 w-4">₵</span>
                          Process Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <span className="h-6 w-6 text-primary">₵</span>
              </div>
              <h3 className="text-lg font-semibold">No owing students found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                There are currently no students with outstanding balances in
                this class, or your search didn't match any students.
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          student={selectedStudent}
        />
      )}
    </div>
  );
}
