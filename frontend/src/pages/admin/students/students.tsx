"use client";

import { Header } from "@/components/typography/heading";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./list/table";
import { useFetchStudents } from "@/services/api/queries";
import { ImportStudentsModal } from "@/components/shared/import-students-modal";
import { useImportStudents } from "@/services/api/queries";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: students, isLoading, error } = useFetchStudents();
  const [showImportModal, setShowImportModal] = useState(false);
  const importStudentsMutation = useImportStudents();

  const handleImportStudents = async (file: File) => {
    // Pass userId to the import mutation
    return await importStudentsMutation.mutateAsync({
      file,
      userId: user?.user?.id,
    });
  };

  return (
    <section>
      {/* Header */}
      <Header
        title="Students"
        buttonText="Add Student"
        buttonAction={() => navigate("/admin/students/add")}
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
      />
    </section>
  );
}
