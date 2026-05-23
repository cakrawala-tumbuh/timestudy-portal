"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Filter } from "lucide-react";
import { getDailyLogs, deleteDailyLog } from "@/lib/api";
import { formatDate, formatHours, formatPercent } from "@/lib/utils";

export function DailyLogList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    resp_id: "",
    tanggal_from: "",
    tanggal_to: "",
    is_synced: "" as "" | "true" | "false",
  });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["daily-logs", page, filters],
    queryFn: () =>
      getDailyLogs({
        page,
        size: 20,
        resp_id: filters.resp_id || undefined,
        tanggal_from: filters.tanggal_from || undefined,
        tanggal_to: filters.tanggal_to || undefined,
        is_synced:
          filters.is_synced === "" ? undefined : filters.is_synced === "true",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDailyLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily-logs"] }),
  });

  const handleDelete = (id: number, respId: string, tanggal: string) => {
    if (confirm(`Hapus log ${respId} tanggal ${tanggal}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Filter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={filters.resp_id}
            onChange={(e) => { setFilters({ ...filters, resp_id: e.target.value }); setPage(1); }}
            placeholder="Kode responden…"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.tanggal_from}
            onChange={(e) => { setFilters({ ...filters, tanggal_from: e.target.value }); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.tanggal_to}
            onChange={(e) => { setFilters({ ...filters, tanggal_to: e.target.value }); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.is_synced}
            onChange={(e) => { setFilters({ ...filters, is_synced: e.target.value as "" | "true" | "false" }); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua status</option>
            <option value="true">Sudah sinkron</option>
            <option value="false">Belum sinkron</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Resp.", "Tanggal", "Masuk", "Pulang", "Istirahat", "Jam Kerja", "Total %", "Core", "Admin", "Warna", "Sync", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={12} className="px-4 py-8 text-center text-slate-400">Memuat…</td></tr>
              ) : (data?.items ?? []).length === 0 ? (
                <tr><td colSpan={12} className="px-4 py-8 text-center text-slate-400">Tidak ada data</td></tr>
              ) : (
                (data?.items ?? []).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs font-bold text-blue-700">{log.resp_id}</td>
                    <td className="px-3 py-3 text-slate-700">{log.tanggal}</td>
                    <td className="px-3 py-3 text-slate-700">{log.jam_masuk}</td>
                    <td className="px-3 py-3 text-slate-700">{log.jam_pulang}</td>
                    <td className="px-3 py-3 text-slate-500">{log.menit_istirahat}m</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{formatHours(log.total_jam_hitung)}</td>
                    <td className="px-3 py-3">
                      <span className={`font-semibold ${
                        log.total_pct >= 95 && log.total_pct <= 105
                          ? "text-emerald-600"
                          : log.total_pct >= 90 && log.total_pct <= 110
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}>
                        {formatPercent(log.total_pct)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{formatPercent(log.pct_core)}</td>
                    <td className="px-3 py-3 text-slate-600">{formatPercent(log.pct_admin)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.day_color === "G" ? "bg-emerald-100 text-emerald-700"
                        : log.day_color === "Y" ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {log.day_color === "G" ? "Normal" : log.day_color === "Y" ? "Sibuk" : "Puncak"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${log.is_synced ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {log.is_synced ? "✓" : "○"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => handleDelete(log.id, log.resp_id, log.tanggal)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(data?.pages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Halaman {data?.page} dari {data?.pages} ({data?.total} data)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 transition">
                ← Sebelumnya
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pages ?? 1)}
                className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 transition">
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
