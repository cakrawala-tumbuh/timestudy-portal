"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  getRespondents,
  createRespondent,
  updateRespondent,
  deleteRespondent,
} from "@/lib/api";
import type { Respondent, RespondentCreate, RespondentUpdate } from "@/types";
import { formatDate } from "@/lib/utils";

function RespondentFormModal({
  respondent,
  onClose,
}: {
  respondent?: Respondent;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!respondent;

  const [form, setForm] = useState<RespondentCreate & RespondentUpdate>({
    resp_id: respondent?.resp_id ?? "",
    name: respondent?.name ?? "",
    email: respondent?.email ?? "",
    phone: respondent?.phone ?? "",
    department: respondent?.department ?? "",
    position: respondent?.position ?? "",
    pin: "",
    is_active: respondent?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const payload: RespondentUpdate = {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          department: form.department || undefined,
          position: form.position || undefined,
          is_active: form.is_active,
          pin: form.pin || undefined,
        };
        return updateRespondent(respondent!.resp_id, payload);
      }
      return createRespondent({
          resp_id: form.resp_id,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          department: form.department || undefined,
          position: form.position || undefined,
          is_active: form.is_active,
          pin: form.pin || undefined,
        });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["respondents"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 mx-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {isEdit ? "Edit Responden" : "Tambah Responden"}
        </h2>

        {mutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            Terjadi kesalahan. Periksa data dan coba lagi.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kode Responden *
              </label>
              <input
                required
                disabled={isEdit}
                value={form.resp_id}
                onChange={(e) => setForm({ ...form, resp_id: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R-001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Lengkap *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama Responden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telepon</label>
              <input
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Departemen</label>
              <input
                value={form.department ?? ""}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jabatan</label>
              <input
                value={form.position ?? ""}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              PIN {isEdit ? "(kosongkan jika tidak diubah)" : "*"}
            </label>
            <input
              type="password"
              value={form.pin ?? ""}
              required={!isEdit}
              minLength={4}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 4 karakter"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">
              Aktif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {mutation.isPending ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RespondentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Respondent | undefined>();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["respondents", page, search],
    queryFn: () => getRespondents({ page, size: 15, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRespondent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["respondents"] }),
  });

  const handleDelete = (resp: Respondent) => {
    if (confirm(`Hapus responden ${resp.resp_id} — ${resp.name}? Semua log terkait akan dihapus.`)) {
      deleteMutation.mutate(resp.resp_id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari kode atau nama…"
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
        >
          <Plus size={16} />
          Tambah Responden
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Kode", "Nama", "Departemen", "Jabatan", "Status", "Dibuat", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Memuat…</td></tr>
              ) : (data?.items ?? []).length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Tidak ada data</td></tr>
              ) : (
                (data?.items ?? []).map((r) => (
                  <tr key={r.resp_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{r.resp_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.department ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.position ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {r.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditTarget(r); setShowForm(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {showForm && (
        <RespondentFormModal
          respondent={editTarget}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
