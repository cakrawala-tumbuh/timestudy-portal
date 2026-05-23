"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CalendarDays,
  CloudOff,
  Calendar,
  BarChart3,
} from "lucide-react";
import { getDashboardStats, getDailyLogs } from "@/lib/api";
import { formatHours, formatPercent } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["recent-logs"],
    queryFn: () => getDailyLogs({ size: 20 }),
  });

  // Build chart data from recent logs (avg pct per category)
  const chartData = recentLogs
    ? (() => {
        const keys = [
          { key: "pct_core", label: "Core" },
          { key: "pct_copilot", label: "Copilot" },
          { key: "pct_character", label: "Character" },
          { key: "pct_improve", label: "Improve" },
          { key: "pct_strategic", label: "Strategic" },
          { key: "pct_admin", label: "Admin" },
          { key: "pct_recovery", label: "Recovery" },
        ];
        const count = recentLogs.items.length || 1;
        return keys.map(({ key, label }) => ({
          name: label,
          avg: parseFloat(
            (
              recentLogs.items.reduce(
                (s, l) => s + (l[key as keyof typeof l] as number),
                0
              ) / count
            ).toFixed(1)
          ),
        }));
      })()
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan data time study</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Responden"
          value={statsLoading ? "…" : (stats?.total_respondents ?? 0)}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Log"
          value={statsLoading ? "…" : (stats?.total_logs ?? 0)}
          icon={CalendarDays}
          color="bg-emerald-600"
          subtitle="semua data tersimpan"
        />
        <StatCard
          title="Belum Disinkron"
          value={statsLoading ? "…" : (stats?.unsynced_logs ?? 0)}
          icon={CloudOff}
          color="bg-amber-500"
        />
        <StatCard
          title="Log Hari Ini"
          value={statsLoading ? "…" : (stats?.logs_today ?? 0)}
          icon={Calendar}
          color="bg-violet-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">
            Rata-rata Distribusi Waktu (20 Log Terbaru)
          </h2>
        </div>
        {logsLoading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">Memuat…</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip formatter={(v) => [`${v}%`, "Rata-rata"]} />
              <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent logs table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Log Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Responden", "Tanggal", "Masuk", "Pulang", "Total Jam", "Total %", "Warna", "Sinkron"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Memuat…
                  </td>
                </tr>
              ) : (recentLogs?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                (recentLogs?.items ?? []).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">
                      {log.resp_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{log.tanggal}</td>
                    <td className="px-4 py-3 text-slate-700">{log.jam_masuk}</td>
                    <td className="px-4 py-3 text-slate-700">{log.jam_pulang}</td>
                    <td className="px-4 py-3 text-slate-700">{formatHours(log.total_jam_hitung)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          log.total_pct >= 95 && log.total_pct <= 105
                            ? "text-emerald-600"
                            : log.total_pct >= 90 && log.total_pct <= 110
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercent(log.total_pct)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.day_color === "G"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.day_color === "Y"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.day_color === "G" ? "Normal" : log.day_color === "Y" ? "Sibuk" : "Puncak"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.is_synced
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {log.is_synced ? "✓" : "○"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
