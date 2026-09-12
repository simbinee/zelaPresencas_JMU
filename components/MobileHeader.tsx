"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { Emblema } from "./Emblema";

export function MobileHeader({
  role,
  nome,
}: {
  role: "ADMIN" | "RESPONSAVEL";
  nome: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-navy-900/10 bg-white px-4 py-3.5 lg:hidden">
        <div className="flex items-center gap-2">
          <Emblema className="h-6 w-6" />
          <span className="text-[13px] font-semibold text-navy-950">JMU Maputo Norte</span>
        </div>
        <button
          onClick={() => setAberto(true)}
          className="focus-ring rounded-md p-2 text-navy-900"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%]">
            <div className="relative h-full">
              <button
                onClick={() => setAberto(false)}
                className="focus-ring absolute right-3 top-4 rounded-md p-1.5 text-white/70 hover:text-white"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
              <SidebarNav role={role} nome={nome} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
