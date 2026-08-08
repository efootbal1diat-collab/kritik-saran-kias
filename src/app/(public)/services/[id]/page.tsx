"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";
import { RadioGroup } from "@/components/RadioGroup";

export default function DynamicServiceForm() {
  const { id } = useParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [respondentName, setRespondentName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Service
    const { data: sData, error: sErr } = await supabase.from("services").select("*").eq("id", id).single();
    if (sErr || !sData) {
      setError("Layanan tidak ditemukan.");
      setLoading(false);
      return;
    }
    setService(sData);

    // Fetch Questions
    const { data: qData } = await supabase.from("questions").select("*").eq("service_id", id).order("order_number", { ascending: true });
    if (qData) {
      setQuestions(qData);
    }
    
    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate required questions
    for (const q of questions) {
      if (q.is_required && !answers[q.id]) {
        setError(`Pertanyaan "${q.question_text}" wajib diisi.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      // 1. Insert Response
      const { data: respData, error: respErr } = await supabase.from("responses").insert([{
        service_id: id,
        respondent_name: respondentName,
        vendor_name: vendorName,
        feedback_text: feedbackText
      }]).select().single();

      if (respErr) throw respErr;

      // 2. Insert Answers
      const answerInserts = Object.keys(answers).map(qId => ({
        response_id: respData.id,
        question_id: qId,
        answer_value: answers[qId].toString()
      }));

      if (answerInserts.length > 0) {
        const { error: ansErr } = await supabase.from("answers").insert(answerInserts);
        if (ansErr) throw ansErr;
      }

      router.push("/success");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim kuesioner.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Memuat formulir...</div>;
  if (error && !service) return <div className="text-center py-10 text-red-500 font-medium">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
      <div className="bg-indigo-600 p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">{service?.name}</h1>
        <p className="text-indigo-100">{service?.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nama / Pekerjaan Anda (Opsional)</label>
            <input 
              type="text"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: Budi - Staff IT"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nama Vendor / Petugas Terkait (Opsional)</label>
            <input 
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: PT. Maju Jaya"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 space-y-8">
          <h2 className="text-lg font-bold text-slate-800">Pertanyaan Penilaian</h2>
          {questions.map((q) => (
            <div key={q.id} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <label className="block text-base font-semibold text-slate-800 mb-4">
                {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
              </label>

              {q.question_type === "star" && (
                <StarRating 
                  value={Number(answers[q.id] || 0)} 
                  onChange={(val: number) => handleAnswerChange(q.id, val)} 
                />
              )}

              {q.question_type === "radio" && (
                <RadioGroup 
                  options={q.options_json || []} 
                  value={String(answers[q.id] || "")} 
                  onChange={(val: string) => handleAnswerChange(q.id, val)} 
                />
              )}

              {q.question_type === "text" && (
                <textarea 
                  rows={3}
                  value={String(answers[q.id] || "")}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Tuliskan jawaban Anda..."
                />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-8">
          <label className="block text-sm font-bold text-slate-700 mb-1">Komentar / Keluhan / Saran Tambahan</label>
          <textarea 
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Silakan tulis masukan Anda di sini..."
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/pilih-layanan")}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-3 font-bold rounded-xl text-white transition-colors ${submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {submitting ? "Mengirim..." : "Kirim Penilaian"}
          </button>
        </div>
      </form>
    </div>
  );
}
