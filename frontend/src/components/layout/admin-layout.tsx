import { Outlet } from "react-router-dom";
import { Toaster } from "../ui/sonner";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AdminSidebar } from "../sidebar/admin-sidebar";
import Navbar from "../navbar/admin-navbar";

export default function AdminLayout() {
  return (
    <SidebarProvider className="overflow-x-hidden w-full max-w-full">
      <AdminSidebar />
      <SidebarInset className="overflow-x-hidden w-full max-w-full">
        <Navbar />
        <main className="h-full overflow-x-auto">
          <Outlet />
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
