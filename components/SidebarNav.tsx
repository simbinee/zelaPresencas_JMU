"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  BarChart3,
  LogOut,
  ClipboardCheck,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Emblema } from "./Emblema";

type Item = { href: string; label: string; icon: React.ReactNode };

export function SidebarNav({
  role,
  nome,
}: {
  role: "ADMIN" | "RESPONSAVEL";
  nome: string;
}) {
  const pathname = usePathname();

  const itensAdmin: Item[] = [
    { href: "/admin", label: "Visão geral", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/eventos", label: "Eventos", icon: <CalendarDays size={18} /> },
    { href: "/admin/candidatos", label: "Candidatos", icon: <Users size={18} /> },
    { href: "/admin/responsaveis", label: "Responsáveis", icon: <UserCog size={18} /> },
    { href: "/admin/relatorios", label: "Relatórios", icon: <BarChart3 size={18} /> },
  ];

  const itensResponsavel: Item[] = [
    { href: "/responsavel", label: "Eventos", icon: <ClipboardCheck size={18} /> },
  ];

  const itens = role === "ADMIN" ? itensAdmin : itensResponsavel;

  return (
    <aside className="flex h-full w-full flex-col bg-navy-950 text-parchment-50">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Emblema className="h-7 w-7" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-wide">JMU Maputo Norte</p>
          <p className="text-[11px] text-parchment-100/50">Sistema de Presenças</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {itens.map((item) => {
          const ativo =
            item.href === "/admin" || item.href === "/responsavel"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors ${
                ativo
                  ? "bg-white/10 font-medium text-white"
                  : "text-parchment-100/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-3 px-2">
          <p className="truncate text-[13px] font-medium text-white">{nome}</p>
          <p className="text-[11px] text-parchment-100/45">
            {role === "ADMIN" ? "Administrador" : "Responsável"}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[14px] text-parchment-100/65 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />
            Terminar sessão
          </button>
        </form>
      </div>
    </aside>
  );
}
