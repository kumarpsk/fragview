import { redirect } from "next/navigation";
import { getAdminOrEditorUser } from "@/lib/admin/permissions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Admin Panel | FragView",
  description: "Admin dashboard for FragView",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
const user = await getAdminOrEditorUser();
if (!user) redirect("/");

const showSidebar = user.role === "ADMIN";


  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#211F1C]">
      {/* Admin Header - keep space for future header if needed */}
      {/* <AdminHeader admin={admin} /> */}

      <div className="flex max-md:flex-col  ">
        {/* Sidebar */}
        {showSidebar && <AdminSidebar />}

        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? "md:ml-64 " : ""}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
