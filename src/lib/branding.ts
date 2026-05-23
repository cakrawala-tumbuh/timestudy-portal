import fs from "fs/promises";
import path from "path";

/** Konfigurasi branding aplikasi yang tersimpan di data/branding.json */
export interface BrandingConfig {
  /** Nama utama aplikasi, ditampilkan di sidebar dan title halaman */
  appName: string;
  /** Subjudul / tagline di bawah nama aplikasi */
  appSubtitle: string;
  /**
   * URL logo: bisa URL eksternal, path lokal (/uploads/...), atau
   * `/api/branding/logo` untuk logo yang di-upload.
   * `null` berarti gunakan ikon default.
   */
  logoUrl: string | null;
  /** Teks yang ditampilkan di footer sidebar */
  footerText: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  appName: "TimeStudy",
  appSubtitle: "Admin Portal",
  logoUrl: null,
  footerText: "TimeStudy Portal",
};

/** Path file konfigurasi branding. Bisa di-override via env BRANDING_FILE_PATH */
export const BRANDING_FILE =
  process.env.BRANDING_FILE_PATH ??
  path.join(process.cwd(), "data", "branding.json");

/** Direktori penyimpanan data runtime (branding.json + logo file) */
export const DATA_DIR = path.dirname(BRANDING_FILE);

/**
 * Membaca konfigurasi branding dari file.
 * Mengembalikan nilai default jika file belum ada atau tidak valid.
 */
export async function getBranding(): Promise<BrandingConfig> {
  try {
    const raw = await fs.readFile(BRANDING_FILE, "utf-8");
    return { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BRANDING };
  }
}

/**
 * Menyimpan pembaruan konfigurasi branding ke file.
 * Melakukan merge dengan konfigurasi yang sudah ada.
 */
export async function saveBranding(
  updates: Partial<BrandingConfig>
): Promise<BrandingConfig> {
  const current = await getBranding();
  const next: BrandingConfig = { ...current, ...updates };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BRANDING_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
