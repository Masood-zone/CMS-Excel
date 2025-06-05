import { Outlet } from "react-router-dom";
import Navbar from "../navbar/admin-navbar";
import { TeacherSidebar } from "../sidebar/teacher-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { Toaster } from "../ui/sonner";

export default function TeacherLayout() {
  return (
    <SidebarProvider className="overflow-x-hidden w-full max-w-full">
      <TeacherSidebar />
      <SidebarInset className="overflow-x-hidden w-full max-w-full">
        <Navbar />
        <main className="p-5 overflow-x-auto">
          <Outlet />
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
