"use client";

import { Header } from "@/components/typography/heading";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./list/table";
import { useFetchStudentsByClass } from "@/services/api/queries";
import { useAuthStore } from "@/store/authStore";
import { ImportStudentsModal } from "@/components/shared/import-students-modal";
import { useImportStudents } from "@/services/api/queries";
import { useState } from "react";

export default function Students() {
  const navigate = useNavigate();
  const { assigned_class, user } = useAuthStore();
  const {
    data: students,
    isLoading,
    error,
  } = useFetchStudentsByClass(assigned_class?.id ?? 0);

  const [showImportModal, setShowImportModal] = useState(false);

  const importStudentsMutation = useImportStudents();

  const handleImportStudents = async (file: File) => {
    return await importStudentsMutation.mutateAsync({
      file,
      classId: assigned_class?.id,
      userId: user?.user?.id,
    });
  };

  return (
    <section>
      {/* Header */}
      <Header
        title={`Students in ${assigned_class?.name}`}
        buttonText="Add Student"
        buttonAction={() => navigate("/teacher/students/add")}
        secondaryButtonText="Import Students"
        secondaryButtonAction={() => setShowImportModal(true)}
      />
      {/* Table */}
      <StudentsTable
        data={students || []}
        isLoading={isLoading}
        error={error}
      />
      <ImportStudentsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportStudents}
        classId={assigned_class?.id}
      />
    </section>
  );
}
