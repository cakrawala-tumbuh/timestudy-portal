"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Copy, CheckCheck } from "lucide-react";
import {
  getOAuthClients,
  createOAuthClient,
  updateOAuthClient,
  deleteOAuthClient,
} from "@/lib/api";
import type { OAuthClient, OAuthClientCreate, OAuthClientUpdate } from "@/types";
import { formatDate } from "@/lib/utils";

function ClientFormModal({
  client,
  onClose,
}: {
  client?: OAuthClient;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!client;

  const [form, setForm] = useState<OAuthClientCreate & OAuthClientUpdate>({
    client_name: client?.client_name ?? "",
    redirect_uris: client?.redirect_uris ?? "com.ypii.timestudy://callback",
    scope: client?.scope ?? "sync",
    grant_types: client?.grant_types ?? "authorization_code refresh_token",
    response_types: client?.response_types ?? "code",
    description: client?.description ?? "",
    is_active: client?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        return updateOAuthClient(client!.client_id, {
          client_name: form.client_name,
          redirect_uris: form.redirect_uris,
          scope: form.scope,
          description: form.description || undefined,
          is_active: form.is_active,
        });
      }
      return createOAuthClient(form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oauth-clients"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 mx-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {isEdit ? "Edit OAuth2 Client" : "Daftarkan Client Baru"}
        </h2>

        {mutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            Terjadi kesalahan. Periksa data dan coba lagi.
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Aplikasi *</label>
            <input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="TimeStudy YPII Android" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Redirect URI(s) *</label>
            <input required value={form.redirect_uris} onChange={(e) => setForm({ ...form, redirect_uris: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="com.ypii.timestudy://callback" />
            <p className="text-xs text-slate-400 mt-1">Pisahkan dengan spasi untuk multiple URI</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Scopes</label>
              <input value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Grant Types</label>
              <input value={form.grant_types} onChange={(e) => setForm({ ...form, grant_types: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
            <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
            <label htmlFor="active" className="text-sm text-slate-700">Aktif</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
              Batal
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
              {mutation.isPending ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} title="Salin" className="p-1 text-slate-400 hover:text-blue-600 transition">
      {copied ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
    </button>
  );
}

export function OAuthClientList() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<OAuthClient | undefined>();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["oauth-clients", page],
    queryFn: () => getOAuthClients({ page, size: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOAuthClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oauth-clients"] }),
  });

  const handleDelete = (c: OAuthClient) => {
    if (confirm(`Hapus client "${c.client_name}"?`)) {
      deleteMutation.mutate(c.client_id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={16} />
          Daftarkan Client
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">Memuat…</div>
        ) : (data?.items ?? []).length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            Belum ada OAuth2 client terdaftar
          </div>
        ) : (
          (data?.items ?? []).map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-900">{c.client_name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24 shrink-0">Client ID:</span>
                      <code className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{c.client_id}</code>
                      <CopyButton text={c.client_id} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24 shrink-0">Redirect URI:</span>
                      <code className="font-mono text-xs text-slate-700">{c.redirect_uris}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24 shrink-0">Scopes:</span>
                      <div className="flex flex-wrap gap-1">
                        {c.scope.split(" ").map((s) => (
                          <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24 shrink-0">Grant Types:</span>
                      <span className="text-xs text-slate-600">{c.grant_types}</span>
                    </div>
                    {c.description && (
                      <p className="text-slate-500 text-xs mt-2">{c.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => { setEditTarget(c); setShowForm(true); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(c)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-100">
                Dibuat {formatDate(c.created_at)}
              </p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <ClientFormModal client={editTarget} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
