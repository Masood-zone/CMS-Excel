import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchClasses,
  createClass,
  fetchStudents,
  createStudent,
  fetchTeachers,
  fetchTeacher,
  updateTeacher,
  createTeacher,
  updateClass,
  fetchStudent,
  updateStudent,
  updateUser,
  fetchRecordsAmount,
  fetchStudentsInClass,
  getPresetAmount,
  fetchRecordsByClassAndDate,
  updateRecordsAmount,
  updateStudentStatus,
  fetchClass,
  fetchTeacherAnalytics,
  fetchAdminAnalytics,
  getTeacherSubmittedRecords,
  submitTeacherRecord,
  getStudentRecordsByClassAndDate,
  fetchExpenses,
  fetchExpense,
  createExpense,
  updateExpense,
  fetchReferences,
  createReference,
  updateReference,
  fetchReference,
  fetchRecords,
  createRecordsAmount,
  getTeacherRecords,
  generateRecordForADate,
} from "@/services/api";
import { apiClient } from "../root";
import { useNavigate } from "react-router-dom";
/**
 * Query: Fetch all records.
 */
export const useFetchRecords = () => {
  return useQuery(["records"], fetchRecords, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch records.");
    },
  });
};
/**
 * Query: Fetch records amount.
 */
export const useFetchRecordsAmount = () => {
  return useQuery(["recordsAmount"], fetchRecordsAmount, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch records amount.");
    },
  });
};
/**
 * Query: Fetch all teachers.
 */
export const useFetchTeachers = () => {
  return useQuery(["teachers"], fetchTeachers, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch teachers.");
    },
  });
};
/**
 * Query: Fetch teacher
 */
export const useFetchTeacher = (id: number) => {
  return useQuery(["teachers", id], () => fetchTeacher(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch teacher.");
    },
  });
};
/**
 * Query: Fetch all classes.
 */
export const useFetchClasses = () => {
  return useQuery(["classes"], fetchClasses, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch classes.");
    },
  });
};

/**
 * Query: Fetch all students.
 */
export const useFetchStudents = () => {
  return useQuery(["students"], fetchStudents, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch students.");
    },
  });
};
/**
 * Query: Fetch all students of a class.
 */
export const useFetchStudentsByClass = (id: number) => {
  return useQuery(["students", id], () => fetchStudentsInClass(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch students in this class.");
    },
  });
};

/**
 * Query: Fetch class by id.
 */
export const useFetchClassById = (id: number) => {
  return useQuery(["classes", id], () => fetchClass(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch class.");
    },
  });
};

/**
 * Query: Fetch a student.
 */
export const useFetchStudent = (id: number) => {
  return useQuery(["teachers", id], () => fetchStudent(id), {
    onError: (error) => {
      console.log(error);
      toast.error("Failed to fetch student.");
    },
  });
};

/**
 * Query: Fetch all expenses.
 */
export const useFetchExpenses = () => {
  return useQuery(["expenses"], fetchExpenses, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch expenses.");
    },
  });
};

/**
 * Query: Fetch all references.
 */
export const useFetchReferences = () => {
  return useQuery(["references"], fetchReferences, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch references.");
    },
  });
};
/**
 * Query: Fetch reference by id.
 */
export const useFetchReference = (id: number) => {
  return useQuery(["references", id], () => fetchReference(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch reference.");
    },
  });
};

/**
 * Fetch expense by id.
 */
export const useFetchExpense = (id: number) => {
  return useQuery(["expenses", id], () => fetchExpense(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch expense.");
    },
  });
};
/**
 * Mutation: Create a new reference
 */
export const useCreateReference = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Reference) => createReference(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["references"]);
      toast.success("Reference created successfully!");
      navigate("/admin/expenses");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create reference. Please try again.");
    },
  });
};

/**
 * Mutation: Update a reference
 */
export const useUpdateReference = () => {
  const queryClient = useQueryClient();
  return useMutation((data: Reference) => updateReference(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["references"]);
      toast.success("References updated successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update expense. Please try again.");
    },
  });
};

/**
 * Mutation: Create a new expense.
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Expense) => createExpense(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success("Expense created successfully!");
      navigate("/admin/expenses");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create expense. Please try again.");
    },
  });
};

/**
 * Mutation: Update an expense.
 */
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Expense) => updateExpense(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success("Expense updated successfully!");
      navigate("/admin/expenses");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update expense. Please try again.");
    },
  });
};

/**
 * Mutation: Update a user by calling upon updateUser function
 */
export const useUpdateUser = () => {
  return useMutation((data: FormUser) => updateUser(data), {
    onSuccess: () => {
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update user. Please try again.");
    },
    onSettled: (data) => {
      // Update the user in localStorage after updating
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...existingUser,
        user: {
          ...existingUser.user,
          email: data?.data.email,
          gender: data?.data.gender,
          name: data?.data.name,
          phone: data?.data.phone,
        },
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    },
  });
};

/**
 * Mutation: Create a teacher.
 */
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Teacher) => createTeacher(data), {
    onSuccess: () => {
      toast.success("Teacher created successfully!");
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["teachers"]);
      //Navigate to the teachers page after creating a teacher
      navigate("/admin/teachers");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create teacher. Please try again.");
    },
  });
};
/**
 * Mutation: Update a teacher.
 */
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Teacher) => updateTeacher(data), {
    onSuccess: () => {
      toast.success("Teacher updated successfully!");
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["teachers"]);
      //Navigate to the teachers page after updating a teacher
      navigate("/admin/teachers");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update teacher. Please try again.");
    },
  });
};

/*
 * Query: Fetch a teacher record detail
 */
export const useFetchTeacherRecordsDetail = (date: Date) => {
  return useQuery(
    ["teacherRecordsDetail", date],
    async () => {
      const response = await apiClient.get(`/records/teachers`, {
        params: {
          date: date.toISOString(),
        },
      });
      return response.data;
    },
    {
      onError: (error) => {
        console.error(error);
        // Handle error (e.g., show a toast notification)
      },
    }
  );
};

/**
 * Mutation: Generate student records.
 */
export const useGenerateStudentRecords = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { classId: number; date: string }) =>
      generateRecordForADate(data.classId, data.date),
    {
      onSuccess: () => {
        toast.success(`Records generated successfully!`);
        queryClient.invalidateQueries(["studentRecords"]);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to generate records.");
      },
    }
  );
};

/**
 * Mutation: Create a new class.
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation(
    (data: { name: string; description: string; supervisorId: number }) =>
      createClass(data),
    {
      onSuccess: () => {
        toast.success("Class created successfully!");
        // Invalidate the query to refresh the table
        queryClient.invalidateQueries(["classes"]);
        //Navigate to the classes page after creating a class
        navigate("/admin/classes");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to create class. Please try again.");
      },
    }
  );
};
/**
 * Mutation: Update a class.
 */
export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Class) => updateClass(data), {
    onSuccess: () => {
      toast.success("Class updated successfully!");
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["classes"]);
      //Navigate to the classes page after updating a class
      navigate("/admin/classes");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update class. Please try again.");
    },
  });
};

/**
 * Mutation: Create a new student.
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Student) => createStudent(data), {
    onSuccess: () => {
      toast.success("Student created successfully!");
      //Navigate to the students page after creating a student
      navigate(-1); //Temporal fix
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["students"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create student. Please try again.");
    },
  });
};
/**
 * Mutation: Update a student.
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation((data: Student) => updateStudent(data), {
    onSuccess: () => {
      toast.success("Student updated successfully!");
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["students"]);
      //Navigate to the students page after updating a student
      navigate(-1); //Temporal fix
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update student. Please try again.");
    },
  });
};

/**
 * Query: Fetch all records of a class by date.
 */
export const useFetchRecordsByClassAndDate = (
  classId: number,
  date: string
) => {
  return useQuery(
    ["records", classId, date],
    () => fetchRecordsByClassAndDate(classId, date),
    {
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch records.");
      },
    }
  );
};

/**
 * Mutation: Create settings amount.
 */
export const useCreateRecordsAmount = () => {
  const queryClient = useQueryClient();
  return useMutation((data: RecordsAmount) => createRecordsAmount(data), {
    onSuccess: () => {
      toast.success("Preset amount created successfully!");
      queryClient.invalidateQueries(["records"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create preset amount.");
    },
  });
};
/**
 * Mutation: Update settings amount.
 */
export const useUpdateRecordsAmount = () => {
  const queryClient = useQueryClient();
  return useMutation((data: RecordsAmount) => updateRecordsAmount(data), {
    onSuccess: () => {
      toast.success("Preset amount updated successfully!");
      queryClient.invalidateQueries(["records"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update preset amount.");
    },
  });
};

/**
 * Query: Get all records of students by class and date.
 */
export const useStudentRecordsByClassAndDate = (
  classId: number,
  date: string
) => {
  return useQuery(
    ["studentRecords", classId, date],
    () => getStudentRecordsByClassAndDate(classId, date),
    {
      enabled: !!classId && !!date,
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch student records.");
      },
    }
  );
};

// New mutation for submitting teacher records
export const useSubmitTeacherRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(submitTeacherRecord, {
    onSuccess: () => {
      queryClient.invalidateQueries(["studentRecords"]);
      queryClient.invalidateQueries(["teacherRecords"]);
      toast.success("Records submitted successfully.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit records.");
    },
  });
};

/**
 * Query: Get all records of absent students by class and date.
 */
export const useTeacherSubmittedRecords = (teacherId: number, date: string) => {
  return useQuery(
    ["submittedRecords", teacherId, date],
    () => getTeacherSubmittedRecords(teacherId, date),
    {
      enabled: !!teacherId && !!date,
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch submitted records.");
      },
    }
  );
};
export const useTeacherRecords = (date: string) => {
  return useQuery(["teacherRecords", date], () => getTeacherRecords(date), {
    enabled: !!date,
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch submitted records.");
    },
  });
};

/**
 * Mutation: Update a student status.
 *
 */
export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation((data: StudentRecord) => updateStudentStatus(data), {
    onSuccess: () => {
      toast.success("Record submitted successfully!");
      queryClient.invalidateQueries(["studentRecords"]);
      queryClient.invalidateQueries(["teacherRecords"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit record.");
    },
  });
};

/**
 * Query: Get preset amount.
 */
export const useGetPresetAmount = () => {
  return useQuery(["presetAmount"], getPresetAmount, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch preset amount.");
    },
  });
};

/**
 * Query: Admin's Analytics
 */
export const useAdminDashboardAnalytics = () => {
  return useQuery(["adminAnalytics"], fetchAdminAnalytics, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch admin analytics.");
    },
  });
};
/**
 * Query: Teacher's Analytics
 */
export const useTeacherAnalytics = (id: number) => {
  return useQuery(["teacherAnalytics", id], () => fetchTeacherAnalytics(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch teacher analytics.");
    },
  });
};

/**
 * Delete a resource and handle errors.
 * @param resource - API endpoint for the resource (e.g., "teachers").
 */
export const useDeleteResource = (resource: string, queryKey: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string | number) => apiClient.delete(`/${resource}/${id}`),
    {
      onMutate: (id) => {
        toast(`Deleting ${resource} with ID ${id}...`);
      },
      onSuccess: () => {
        // Invalidate the query to refresh the table
        queryClient.invalidateQueries([queryKey]);
        toast.success(`${resource} deleted successfully!`);
      },
      onError: (error, id) => {
        console.error(error);
        toast.error(`Failed to delete ${resource} with ID ${id}.`);
      },
    }
  );
};
