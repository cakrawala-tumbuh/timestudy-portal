import type { Metadata } from "next";
import { DailyLogList } from "@/components/daily-logs/daily-log-list";

export const metadata: Metadata = { title: "Log Harian" };

export default function DailyLogsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Log Harian</h1>
        <p className="text-slate-500 text-sm mt-1">Data log waktu kerja responden</p>
      </div>
      <DailyLogList />
    </div>
  );
}
