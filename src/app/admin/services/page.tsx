"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ensureServicesSeeded } from "@/lib/seedServices";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  LayoutList,
  Car,
  Utensils,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  LayoutDashboard,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  raw_description?: string;
  icon_type: string;
  is_active: boolean;
  tujuan?: string;
  petunjuk?: string;
  url?: string;
}

export default function ServicesManager() {
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_type: "Car",
    is_active: true,
    tujuan: "",
    petunjuk: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) router.push("/admin/login");
    else fetchServices();
  }, [router]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      await ensureServicesSeeded();

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        const sorted = [...data].sort((a, b) => {
          const order = ["Layanan Pengemudi", "Layanan Kantin / Catering", "Layanan Security"];
          const idxA = order.indexOf(a.name);
          const idxB = order.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        const list: ServiceItem[] = sorted.map((d: any) => {
          let descText = d.description || "";
          let tujuanText = d.tujuan || "";
          let petunjukText = d.petunjuk || "";

          // Parse JSON if description stores structured data
          try {
            if (descText.startsWith("{")) {
              const parsed = JSON.parse(descText);
              descText = parsed.desc || "";
              tujuanText = parsed.tujuan || "";
              petunjukText = parsed.petunjuk || "";
            }
          } catch (e) {}

          return {
            id: d.id,
            name: d.name,
            description: descText,
            raw_description: d.description,
            icon_type: d.icon_type || "Car",
            is_active: d.is_active ?? true,
            tujuan: tujuanText,
            petunjuk: petunjukText,
            url: `/services/${d.id}`,
          };
        });

        setAllServices(list);
      } else {
        setAllServices([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    let metaDescription = formData.description;
    if (formData.tujuan || formData.petunjuk) {
      metaDescription = JSON.stringify({
        desc: formData.description,
        tujuan: formData.tujuan,
        petunjuk: formData.petunjuk
      });
    }

    const payload: any = {
      name: formData.name,
      description: metaDescription,
      icon_type: formData.icon_type,
      is_active: formData.is_active,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert([payload]);
        if (error) throw error;
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.message || "Gagal menyimpan data ke database.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon_type: "Car",
      is_active: true,
      tujuan: "",
      petunjuk: "",
    });
    setEditingId(null);
    setSaveError("");
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      icon_type: service.icon_type,
      is_active: service.is_active,
      tujuan: service.tujuan || "",
      petunjuk: service.petunjuk || "",
    });
    setSaveError("");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus layanan ini? Semua pertanyaan dan respon terkait akan terhapus!"
      )
    ) {
      await supabase.from("services").delete().eq("id", id);
      fetchServices();
    }
  };

  const toggleActive = async (service: ServiceItem) => {
    const nextStatus = !service.is_active;
    await supabase
      .from("services")
      .update({ is_active: nextStatus })
      .eq("id", service.id);

    const updated = allServices.map((s) =>
      s.id === service.id ? { ...s, is_active: nextStatus } : s
    );
    setAllServices(updated);
  };

  const renderIcon = (iconStr: string) => {
    if (iconStr === "Car") return <Car className="w-6 h-6 text-blue-600" />;
    if (iconStr === "Utensils") return <Utensils className="w-6 h-6 text-orange-600" />;
    if (iconStr === "ShieldCheck") return <ShieldCheck className="w-6 h-6 text-green-600" />;
    return <AlertCircle className="w-6 h-6 text-indigo-600" />;
  };

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row overflow-hidden font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/logo-kias.jpg" alt="KIAS" className="h-7 w-auto object-contain" />
          <h2 className="text-base font-bold text-slate-800">Admin Panel</h2>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 bg-slate-100 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } md:flex absolute md:relative z-20 w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-6 flex-col h-[calc(100vh-73px)] md:h-full top-[73px] md:top-0 left-0`}
      >
        <div className="hidden md:flex flex-col mb-6">
          <img
            src="/logo-kias.jpg"
            alt="PT. Karanganyar Indo Auto Systems"
            className="h-10 w-auto object-contain mb-2 self-start"
          />
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            ADMIN PANEL GA
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors"
          >
            <LayoutDashboard className="mr-3 w-5 h-5" />
            Dashboard Utama
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors"
          >
            <FileText className="mr-3 w-5 h-5" />
            Kelola Layanan / Form
          </Link>
          <Link
            href="/admin/results"
            className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors"
          >
            <BarChart3 className="mr-3 w-5 h-5" />
            Hasil Survey (GA)
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Kelola Layanan / Form GA
              </h1>
              <p className="text-slate-500 mt-1">
                Atur judul kuesioner, tujuan, petunjuk pengisian, dan daftar pertanyaannya.
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Layanan Baru
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Memuat daftar layanan...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-blue-300 transition-all duration-200"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-100 rounded-xl">
                        {renderIcon(service.icon_type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(service)}
                          className={`flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            service.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {service.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              Non-Aktif
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                      {service.description || "Survey kepuasan layanan GA"}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/services/${service.id}/questions`}
                        className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-sm text-center flex items-center justify-center transition-colors"
                      >
                        <LayoutList className="w-4 h-4 mr-1.5" />
                        Atur Kuesioner
                      </Link>

                      <Link
                        href={service.url || `/services/${service.id}`}
                        target="_blank"
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center justify-center transition-colors"
                        title="Lihat Form Publik"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Lihat Form
                      </Link>
                    </div>

                    <div className="flex justify-end gap-1 pt-1">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="Edit Info Layanan (Judul, Tujuan & Petunjuk)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        title="Hapus Layanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Edit / Tambah Layanan */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Info Layanan & Banner Header" : "Tambah Layanan Baru"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Layanan (Judul Kuesioner)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Layanan Pengemudi"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Judul di atas form akan otomatis tampil: <strong className="text-slate-700 uppercase">KUESIONER KEPUASAN {formData.name || "[NAMA LAYANAN]"}</strong>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tujuan Kuesioner (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.tujuan}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan: e.target.value })
                  }
                  placeholder="Kosongkan untuk menggunakan kalimat standar bawaan..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Petunjuk Pengisian (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.petunjuk}
                  onChange={(e) =>
                    setFormData({ ...formData, petunjuk: e.target.value })
                  }
                  placeholder="Kosongkan untuk menggunakan kalimat standar bawaan..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi Kartu Halaman Depan
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Contoh: Survey kepuasan layanan driver dan transport."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pilih Ikon
                </label>
                <select
                  value={formData.icon_type}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_type: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="Car">Mobil / Transport (Car)</option>
                  <option value="Utensils">Makanan / Kantin (Utensils)</option>
                  <option value="ShieldCheck">Keamanan / Security (ShieldCheck)</option>
                  <option value="AlertCircle">Layanan Umum (AlertCircle)</option>
                </select>
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="active"
                  className="ml-2 text-sm text-slate-700 cursor-pointer"
                >
                  Tampilkan layanan ini di halaman publik
                </label>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
