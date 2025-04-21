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
import {
  ArrowUpDown,
  // Download,
  // RefreshCw,
  ExternalLink,
  Filter,
  Search,
  Users,
  Calculator,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// Define the Student type
interface Student {
  id: number;
  name: string;
  class?: {
    id: number;
    name: string;
  };
  gender: string;
  owing: number;
}

// Define the Class type
interface Class {
  id: number;
  name: string;
}

export default function Owings() {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  const { data: classes, isLoading: classesLoading } = useFetchClasses();
  const { data: owingStudents, isLoading: owingLoading } =
    useFetchOwingStudentsByClass(
      selectedClassId ? Number.parseInt(selectedClassId) : undefined
    );

  const handleViewDetails = (studentId: number) => {
    navigate(`/admin/owings/${studentId}`);
  };

  // Filter students based on search query
  const filteredStudents =
    owingStudents?.owingStudents?.filter(
      (student: Student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.class?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Owings</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage students with outstanding canteen payments
          </p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div> */}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Total Owing</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₵{owingStudents?.totalOwing?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {owingStudents?.count || 0} students
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">
              Owing Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {owingStudents?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedClassId !== "all"
                ? "In selected class"
                : "Across all classes"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">
              Average Owing
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₵
              {owingStudents?.count
                ? (owingStudents.totalOwing / owingStudents.count).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per student</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Filter by class:</p>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((classItem: Class) => (
                  <SelectItem
                    key={classItem.id}
                    value={classItem.id.toString()}
                  >
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              <Badge
                className="ml-2 bg-primary text-primary-foreground"
                variant="secondary"
              >
                1
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>Amount: High to Low</DropdownMenuItem>
            <DropdownMenuItem>Amount: Low to High</DropdownMenuItem>
            <DropdownMenuItem>Name: A to Z</DropdownMenuItem>
            <DropdownMenuItem>Name: Z to A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {classesLoading || owingLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center space-x-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Amount Owing</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: Student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.class?.name}</Badge>
                    </TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          student.owing > 50 ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        ₵{student.owing}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(Number(student.id))}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {searchQuery
                      ? "No students match your search"
                      : "No owing students found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            <strong>{owingStudents?.owingStudents?.length || 0}</strong>{" "}
            students
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
