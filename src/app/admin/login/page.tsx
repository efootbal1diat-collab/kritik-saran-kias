"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("admin_password")
        .eq("id", 1)
        .single();

      if (error) throw error;

      if (data && data.admin_password === password) {
        // Success
        sessionStorage.setItem("admin_auth", "true");
        router.push("/admin/dashboard");
      } else {
        setError("Password salah!");
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal terhubung ke database. Cek koneksi internet atau konfigurasi Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Login Admin GA</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">Masukkan password untuk mengakses Dashboard Analytics</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Memeriksa..." : "Masuk Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
