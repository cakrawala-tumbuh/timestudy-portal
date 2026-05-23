"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function Header({ session }: { session: Session }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
            <User size={15} />
          </div>
          <span className="font-medium hidden sm:block">
            {session.user?.name ?? session.user?.username}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded"
          title="Keluar"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
