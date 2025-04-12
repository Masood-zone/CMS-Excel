import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFetchTeacherClassStudents } from "@/services/api/queries";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function OwingStudents() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const teacherId = user?.user?.id || 0;
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: students,
    isLoading,
    error,
  } = useFetchTeacherClassStudents(teacherId);

  const filteredStudents = students?.filter((student: Student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (studentId: number) => {
    navigate(`/teacher/students/owing-students/${studentId}`);
  };

  if (isLoading) return <TableSkeleton />;
  if (error)
    return (
      <Card className="mx-auto max-w-md mt-8">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700 flex items-center gap-2">
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>Unable to fetch students. Please try again later.</p>
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
    <div className="container mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Class Students
              </CardTitle>
              <CardDescription className="text-base mt-1">
                View all students in your class and their details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{students?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Students in your class
          </p>
        </CardContent>
      </Card>

      {/* Search and Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            View and manage students in your class
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
                    <TableHead>Owing Status</TableHead>
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
                        {student.owing && student.owing > 0 ? (
                          <Badge
                            variant="destructive"
                            className="font-semibold"
                          >
                            Owing ₵{student.owing.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="font-semibold">
                            No Owing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewDetails(Number(student.id))}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No students found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                There are currently no students in your class, or your search
                didn't match any students.
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
    </div>
  );
}
