import type { Metadata } from "next";
import { OAuthClientList } from "@/components/oauth/oauth-client-list";

export const metadata: Metadata = { title: "OAuth2 Clients" };

export default function OAuthPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">OAuth2 Clients</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola klien OAuth2 untuk aplikasi Android
        </p>
      </div>
      <OAuthClientList />
    </div>
  );
}
