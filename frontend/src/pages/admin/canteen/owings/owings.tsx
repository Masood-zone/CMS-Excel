import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFetchClasses,
  useFetchOwingStudentsByClass,
} from "@/services/api/queries";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ExternalLink, DollarSign, Users, Calculator } from "lucide-react";

interface Class {
  id: number;
  name: string;
}

export default function Owings() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const navigate = useNavigate();

  const { data: classes, isLoading: classesLoading } = useFetchClasses();
  const { data: owingStudents, isLoading: owingLoading } =
    useFetchOwingStudentsByClass(
      selectedClassId ? Number.parseInt(selectedClassId) : undefined
    );

  const handleViewDetails = (studentId: number) => {
    navigate(`/admin/owings/${studentId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Student Owings</h2>
        <p className="text-muted-foreground">
          Track and manage students with outstanding canteen payments. Select a
          class to filter students or view all owing students.
        </p>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Select onValueChange={setSelectedClassId} value={selectedClassId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes?.map((classItem: Class) => (
              <SelectItem key={classItem.id} value={classItem.id.toString()}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Owing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{owingStudents?.totalOwing || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Owing Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {owingStudents?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Average Owing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵
              {owingStudents?.count
                ? (owingStudents.totalOwing / owingStudents.count).toFixed(2)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {classesLoading || owingLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Amount Owing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owingStudents?.owingStudents?.length ? (
                owingStudents?.owingStudents.map((student: Student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.class?.name}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>₵{student.owing}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(Number(student.id))}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No owing students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
