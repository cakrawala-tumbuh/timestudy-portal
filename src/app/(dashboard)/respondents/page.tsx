import type { Metadata } from "next";
import { RespondentList } from "@/components/respondents/respondent-list";

export const metadata: Metadata = { title: "Responden" };

export default function RespondentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Responden</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola data responden time study</p>
      </div>
      <RespondentList />
    </div>
  );
}
