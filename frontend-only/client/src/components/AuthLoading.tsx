import { Loader2, Sparkles } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 px-4">
      <div className="flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-blue-100 bg-white/90 p-10 shadow-2xl shadow-blue-500/10 backdrop-blur-xl animate-in fade-in duration-700">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-blue-900 to-blue-700 shadow-lg shadow-blue-900/30">
          <Sparkles className="h-10 w-10 text-white" />
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-blue-900 shadow-sm shadow-blue-500/10">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>

        <p className="text-center text-lg font-semibold text-slate-900">
          Restoring your session...
        </p>
      </div>
    </div>
  );
}
