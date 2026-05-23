import type { Metadata } from "next";
import { getBranding } from "@/lib/branding";
import { BrandingForm } from "@/components/settings/branding-form";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const branding = await getBranding();
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola branding dan tampilan portal
        </p>
      </div>
      <BrandingForm initialBranding={branding} />
    </div>
  );
}
