"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Star, List, Type, FileText } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function QuestionsManager() {
  const [serviceName, setServiceName] = useState("Loading...");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    question_text: "", 
    question_type: "star", 
    options_json: "", 
    order_number: 1,
    is_required: true 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) router.push("/admin/login");
    else {
      fetchService();
      fetchQuestions();
    }
  }, [router, serviceId]);

  const fetchService = async () => {
    const { data } = await supabase.from("services").select("name").eq("id", serviceId).single();
    if (data) setServiceName(data.name);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase.from("questions").select("*").eq("service_id", serviceId).order("order_number", { ascending: true });
    if (data) setQuestions(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse options_json jika tipe radio
    let parsedOptions = null;
    if (formData.question_type === "radio" && formData.options_json) {
      // Misal input: "Baik, Buruk, Cukup" -> ["Baik", "Buruk", "Cukup"]
      parsedOptions = formData.options_json.split(",").map(s => s.trim()).filter(s => s !== "");
    }

    const payload = {
      service_id: serviceId,
      question_text: formData.question_text,
      question_type: formData.question_type,
      options_json: parsedOptions,
      order_number: formData.order_number,
      is_required: formData.is_required
    };

    if (editingId) {
      await supabase.from("questions").update(payload).eq("id", editingId);
    } else {
      await supabase.from("questions").insert([payload]);
    }
    
    setShowModal(false);
    resetForm();
    fetchQuestions();
  };

  const resetForm = () => {
    setFormData({ question_text: "", question_type: "star", options_json: "", order_number: questions.length + 1, is_required: true });
    setEditingId(null);
  };

  const handleEdit = (q: any) => {
    setFormData({ 
      question_text: q.question_text, 
      question_type: q.question_type, 
      options_json: q.options_json ? q.options_json.join(", ") : "", 
      order_number: q.order_number,
      is_required: q.is_required
    });
    setEditingId(q.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus pertanyaan ini? Data jawaban untuk pertanyaan ini juga akan terhapus!")) {
      await supabase.from("questions").delete().eq("id", id);
      fetchQuestions();
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === "star") return <span className="flex items-center text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-md"><Star className="w-3 h-3 mr-1"/> Bintang 1-5</span>;
    if (type === "radio") return <span className="flex items-center text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md"><List className="w-3 h-3 mr-1"/> Pilihan Ganda</span>;
    return <span className="flex items-center text-xs font-medium text-slate-700 bg-slate-200 px-2 py-1 rounded-md"><Type className="w-3 h-3 mr-1"/> Teks Bebas</span>;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin/services" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Layanan
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="mr-3 text-blue-600" /> Kuesioner: {serviceName}
          </h1>
          <p className="text-slate-500 mt-1">Atur daftar pertanyaan yang akan muncul di form layanan ini.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Pertanyaan
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat pertanyaan...</p>
      ) : questions.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm border-dashed border-2">
          <p className="text-slate-500">Kuesioner masih kosong. Ayo tambahkan pertanyaan pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start group">
              <div className="bg-slate-100 text-slate-500 font-bold rounded-lg w-10 h-10 flex items-center justify-center shrink-0 mr-4">
                {q.order_number}
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-800">{q.question_text}</h3>
                  {q.is_required && <span className="text-xs text-red-500 font-medium">*Wajib</span>}
                </div>
                <div className="flex items-center gap-3">
                  {getTypeBadge(q.question_type)}
                  {q.question_type === "radio" && q.options_json && (
                    <span className="text-xs text-slate-500">Opsi: {q.options_json.join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Pertanyaan" : "Tambah Pertanyaan"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan</label>
                <input 
                  type="text" 
                  value={formData.question_text} 
                  onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                  placeholder="Contoh: Bagaimana rasa makanannya?"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Jawaban</label>
                  <select 
                    value={formData.question_type} 
                    onChange={(e) => setFormData({...formData, question_type: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="star">Bintang 1 - 5</option>
                    <option value="radio">Pilihan Ganda</option>
                    <option value="text">Teks Bebas (Saran)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Urut</label>
                  <input 
                    type="number" 
                    value={formData.order_number} 
                    onChange={(e) => setFormData({...formData, order_number: parseInt(e.target.value)})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min={1} required 
                  />
                </div>
              </div>

              {formData.question_type === "radio" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-medium text-blue-800 mb-1">Pilihan Ganda (Pisahkan dengan koma)</label>
                  <input 
                    type="text" 
                    value={formData.options_json} 
                    onChange={(e) => setFormData({...formData, options_json: e.target.value})}
                    placeholder="Contoh: Sangat Baik, Baik, Kurang"
                    className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required 
                  />
                </div>
              )}

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="req" 
                  checked={formData.is_required}
                  onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="req" className="ml-2 text-sm text-slate-700 cursor-pointer">Pertanyaan ini wajib diisi</label>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
