import GoBackButton from "@/components/shared/go-back/go-back";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useFetchAdmin } from "@/services/api/queries";
import EditAdminForm from "./edit-admin-form";

export default function EditTeacher() {
  const { id } = useParams();
  const { data: admin, error } = useFetchAdmin(Number(id)) as {
    data: Admin;
    error: { message: string };
  };
  const adminData = admin;

  return (
    <section className="w-full">
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Administrator</h1>
            <GoBackButton />
          </CardTitle>
          <CardDescription>
            Fill in the details below to edit the administrator.
          </CardDescription>
        </CardHeader>
        {error ? (
          <p>{error.message}</p>
        ) : (
          <EditAdminForm adminData={adminData} />
        )}
      </Card>
    </section>
  );
}
