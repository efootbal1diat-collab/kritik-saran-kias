"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Plus, Edit2, Trash2, LayoutList, Car, Utensils, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", icon_type: "Car" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Cek auth
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) router.push("/admin/login");
    else fetchServices();
  }, [router]);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
    if (!error && data) setServices(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Update
      await supabase.from("services").update(formData).eq("id", editingId);
    } else {
      // Create
      await supabase.from("services").insert([formData]);
    }
    setShowModal(false);
    setFormData({ name: "", description: "", icon_type: "Car" });
    setEditingId(null);
    fetchServices();
  };

  const handleEdit = (service: any) => {
    setFormData({ name: service.name, description: service.description, icon_type: service.icon_type });
    setEditingId(service.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus layanan ini? Semua data kuesioner terkait juga akan terhapus!")) {
      await supabase.from("services").delete().eq("id", id);
      fetchServices();
    }
  };

  const renderIcon = (iconStr: string) => {
    if (iconStr === "Car") return <Car className="w-5 h-5 text-blue-500" />;
    if (iconStr === "Utensils") return <Utensils className="w-5 h-5 text-orange-500" />;
    if (iconStr === "ShieldCheck") return <ShieldCheck className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <LayoutList className="mr-3 text-blue-600" /> Kelola Layanan / Form
          </h1>
          <p className="text-slate-500 mt-1">Buat dan atur jenis layanan yang ingin disurvey.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/dashboard" className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
            Kembali
          </Link>
          <button 
            onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: "", description: "", icon_type: "Car" }); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Layanan
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat data...</p>
      ) : services.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-800">Belum Ada Layanan</h3>
          <p className="text-slate-500 mt-1">Klik tombol 'Tambah Layanan' untuk membuat kuesioner pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-slate-50 rounded-lg mr-4 border border-slate-100">
                  {renderIcon(service.icon_type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{service.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {service.is_active ? "Aktif" : "Non-Aktif"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6 flex-grow">{service.description || "Tidak ada deskripsi."}</p>
              
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center space-x-2">
                <Link 
                  href={`/admin/services/${service.id}/questions`}
                  className="flex-grow text-center bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Atur Kuesioner
                </Link>
                <button onClick={() => handleEdit(service)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Layanan" : "Tambah Layanan Baru"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Layanan</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Layanan Pengemudi"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Survey kepuasan driver..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ikon Layanan</label>
                <select 
                  value={formData.icon_type} 
                  onChange={(e) => setFormData({...formData, icon_type: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Car">Mobil / Pengemudi</option>
                  <option value="Utensils">Garpu & Pisau / Kantin</option>
                  <option value="ShieldCheck">Perisai / Security</option>
                  <option value="AlertCircle">Umum / Bulat</option>
                </select>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
