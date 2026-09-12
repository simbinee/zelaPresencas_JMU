import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";
import { MobileHeader } from "@/components/MobileHeader";

export default async function ResponsavelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-parchment-50 lg:flex">
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed h-screen w-64">
          <SidebarNav role={session.role} nome={session.nome} />
        </div>
      </div>
      <div className="flex-1">
        <MobileHeader role={session.role} nome={session.nome} />
        <main className="mx-auto max-w-3xl px-4 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
