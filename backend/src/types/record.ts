export interface TeacherRecord {
  classId: number;
  date: string;
  unpaidStudents?: Array<{
    id: number;
    amount: number;
    paidBy: string;
    hasPaid: boolean;
    date: string;
    name?: string;
    class?: string;
  }>;
  paidStudents?: Array<{
    id: number;
    amount: number;
    paidBy: string;
    hasPaid: boolean;
    date: string;
    name?: string;
    class?: string;
  }>;
  absentStudents?: Array<{
    id: number;
    amount_owing: number;
    paidBy: string;
    hasPaid: boolean;
    date: string;
    name?: string;
    class?: string;
  }>;
  submittedBy: number;
  teacher?: {
    id: number;
    name: string;
  };
  class?: {
    id: number;
    name: string;
  };
}
