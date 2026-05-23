import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBranding, saveBranding, DATA_DIR } from "@/lib/branding";
import fs from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/** GET /api/branding/logo — menyajikan file logo yang telah di-upload */
export async function GET() {
  const branding = await getBranding();
  if (!branding.logoUrl || branding.logoUrl !== "/api/branding/logo") {
    return NextResponse.json({ error: "No logo" }, { status: 404 });
  }

  // Cari file logo (jpg/png/webp)
  for (const ext of ["jpg", "png", "webp"]) {
    const logoPath = path.join(DATA_DIR, `logo.${ext}`);
    try {
      const buffer = await fs.readFile(logoPath);
      const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      // file tidak ditemukan, coba ekstensi berikutnya
    }
  }

  return NextResponse.json({ error: "Logo file not found" }, { status: 404 });
}

/** POST /api/branding/logo — upload logo baru (hanya superuser, maks 2MB) */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user?.is_superuser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Tidak ada file yang dikirim" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Hanya file JPG, PNG, atau WebP yang diperbolehkan" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 2MB" },
      { status: 400 }
    );
  }

  await fs.mkdir(DATA_DIR, { recursive: true });

  // Hapus logo lama
  for (const oldExt of ["jpg", "png", "webp"]) {
    try {
      await fs.unlink(path.join(DATA_DIR, `logo.${oldExt}`));
    } catch {
      // abaikan jika tidak ada
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(
    path.join(DATA_DIR, `logo.${ext}`),
    Buffer.from(arrayBuffer)
  );

  // Simpan referensi logo di branding.json
  await saveBranding({ logoUrl: "/api/branding/logo" });

  return NextResponse.json({ url: "/api/branding/logo" });
}
