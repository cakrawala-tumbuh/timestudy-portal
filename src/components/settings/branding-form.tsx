"use client";

import { useState, useRef } from "react";
import { Upload, X, Clock } from "lucide-react";
import type { BrandingConfig } from "@/lib/branding";

interface BrandingFormProps {
  initialBranding: BrandingConfig;
}

export function BrandingForm({ initialBranding }: BrandingFormProps) {
  const [branding, setBranding] = useState<BrandingConfig>(initialBranding);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan");
      }
      setMessage({
        type: "success",
        text: "Branding berhasil disimpan. Refresh halaman untuk melihat perubahan di seluruh portal.",
      });
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Gagal menyimpan",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/branding/logo", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal upload logo");
      }
      const { url } = await res.json();
      setBranding((prev) => ({ ...prev, logoUrl: url }));
      setMessage({
        type: "success",
        text: "Logo berhasil diupload. Klik Simpan Perubahan untuk menerapkan.",
      });
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Gagal upload logo",
      });
    } finally {
      setUploading(false);
    }
  };

  // Cache-bust URL logo agar browser memuat ulang setelah upload
  const logoPreviewUrl =
    branding.logoUrl === "/api/branding/logo"
      ? `/api/branding/logo?t=${Date.now()}`
      : branding.logoUrl;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      {/* Nama Aplikasi */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nama Aplikasi
        </label>
        <input
          type="text"
          value={branding.appName}
          onChange={(e) =>
            setBranding((p) => ({ ...p, appName: e.target.value }))
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="TimeStudy"
        />
        <p className="text-xs text-slate-400 mt-1">
          Ditampilkan di sidebar, halaman login, dan tab browser.
        </p>
      </div>

      {/* Subjudul */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Subjudul / Tagline
        </label>
        <input
          type="text"
          value={branding.appSubtitle}
          onChange={(e) =>
            setBranding((p) => ({ ...p, appSubtitle: e.target.value }))
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Admin Portal"
        />
      </div>

      {/* Teks Footer */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Teks Footer
        </label>
        <input
          type="text"
          value={branding.footerText}
          onChange={(e) =>
            setBranding((p) => ({ ...p, footerText: e.target.value }))
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nama Perusahaan"
        />
        <p className="text-xs text-slate-400 mt-1">
          Ditampilkan sebagai &quot;© {new Date().getFullYear()} [Teks Footer]&quot; di bagian bawah sidebar.
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Logo
        </label>

        {/* Preview */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 overflow-hidden shrink-0">
            {logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreviewUrl}
                alt="Logo preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <Clock className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="text-sm text-slate-600">
            {branding.logoUrl ? (
              <div className="flex items-center gap-2">
                <span className="text-green-700 font-medium">Logo terpasang</span>
                <button
                  type="button"
                  onClick={() =>
                    setBranding((p) => ({ ...p, logoUrl: null }))
                  }
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs transition-colors"
                >
                  <X size={13} /> Hapus Logo
                </button>
              </div>
            ) : (
              <span className="text-slate-400">Menggunakan ikon default</span>
            )}
          </div>
        </div>

        {/* Upload file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLogoUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Upload size={15} />
          {uploading ? "Mengupload…" : "Upload Logo"}
        </button>
        <p className="text-xs text-slate-400 mt-1.5">
          Format: JPG, PNG, atau WebP — Maksimal 2MB
        </p>

        {/* URL manual */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Atau masukkan URL logo (eksternal)
          </label>
          <input
            type="url"
            value={
              branding.logoUrl && branding.logoUrl !== "/api/branding/logo"
                ? branding.logoUrl
                : ""
            }
            onChange={(e) =>
              setBranding((p) => ({
                ...p,
                logoUrl: e.target.value.trim() || null,
              }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>

      {/* Pesan status */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tombol simpan */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
