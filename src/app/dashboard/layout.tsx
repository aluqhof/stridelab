import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/header";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <DashboardNav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
