import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBranding, saveBranding } from "@/lib/branding";

/** GET /api/branding — mengembalikan konfigurasi branding saat ini (publik) */
export async function GET() {
  const branding = await getBranding();
  return NextResponse.json(branding);
}

/** POST /api/branding — memperbarui konfigurasi branding (hanya superuser) */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user?.is_superuser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, string | null> = {};

  if (typeof body.appName === "string" && body.appName.trim()) {
    updates.appName = body.appName.trim();
  }
  if (typeof body.appSubtitle === "string") {
    updates.appSubtitle = body.appSubtitle.trim();
  }
  if (body.logoUrl === null || typeof body.logoUrl === "string") {
    updates.logoUrl = body.logoUrl;
  }
  if (typeof body.footerText === "string") {
    updates.footerText = body.footerText.trim();
  }

  const saved = await saveBranding(updates);
  return NextResponse.json(saved);
}
