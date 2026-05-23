"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  KeyRound,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrandingConfig } from "@/lib/branding";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/respondents", label: "Responden", icon: Users },
  { href: "/daily-logs", label: "Log Harian", icon: CalendarDays },
  { href: "/oauth", label: "OAuth2 Clients", icon: KeyRound },
];

interface SidebarProps {
  branding: BrandingConfig;
  isSuperuser?: boolean;
}

export function Sidebar({ branding, isSuperuser }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col bg-slate-900 text-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 overflow-hidden shrink-0">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.appName}
              className="object-cover w-full h-full"
            />
          ) : (
            <Clock className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">{branding.appName}</p>
          <p className="text-slate-400 text-xs">{branding.appSubtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {label}
            </Link>
          );
        })}
        {isSuperuser && (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/settings" || pathname.startsWith("/settings/")
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Settings size={18} className="shrink-0" />
            Pengaturan
          </Link>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-slate-500 text-xs">
          © {new Date().getFullYear()} {branding.footerText}
        </p>
      </div>
    </aside>
  );
}
