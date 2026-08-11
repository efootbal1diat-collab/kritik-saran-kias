"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";

function RadioScale({ label, subtitle, value, options, onChange }: { label: string, subtitle?: string, value: string, options?: string[], onChange: (val: string) => void }) {
  const defaultOptions = [
    "4. Sangat Baik",
    "3. Baik",
    "2. Kurang Baik",
    "1. Tidak Baik"
  ];
  const items = options && options.length > 0 ? options : defaultOptions;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
      <div>
        <label className="text-sm font-semibold text-slate-800 block">{label}</label>
        {subtitle && <span className="text-xs text-slate-500 block mt-0.5">{subtitle}</span>}
      </div>
      
      <div className="flex flex-col gap-2">
        {items.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 transition-colors">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${value === opt ? 'border-blue-600' : 'border-slate-300 group-hover:border-blue-500'}`}>
              {value === opt && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
              )}
            </div>
            <input
              type="radio"
              className="hidden"
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span className={`text-sm ${value === opt ? 'text-blue-900 font-medium' : 'text-slate-600'}`}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function DynamicServiceForm() {
  const { id } = useParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [customTargetText, setCustomTargetText] = useState("");

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

  // Parsing Helper to split title and parenthesis subtitle
  const parseQuestionText = (text: string) => {
    const match = text.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (match) {
      return {
        title: match[1].trim(),
        subtitle: match[2].trim()
      };
    }
    return {
      title: text.trim(),
      subtitle: ""
    };
  };

  const isDriver = service?.name?.toLowerCase().includes("driver") || service?.name?.toLowerCase().includes("pengemudi");
  const isKantin = service?.name?.toLowerCase().includes("kantin") || service?.name?.toLowerCase().includes("catering");
  const isSecurity = service?.name?.toLowerCase().includes("security");

  // Group Questions - ensure target question is extracted properly and NEVER repeated
  let targetQuestion = questions.find(q => q.question_type === "radio" && q.question_text.toLowerCase().startsWith("pilih"));
  
  if (!targetQuestion) {
    if (isDriver) {
      targetQuestion = {
        id: "fallback-driver",
        question_text: "Pilih Driver:",
        question_type: "radio",
        options_json: ["Hanan", "Adhit", "Richard", "Boby", "Eric", "Abdur", "Sriyono", "Lainnya..."],
        is_required: true
      };
    } else if (isKantin) {
      targetQuestion = {
        id: "fallback-kantin",
        question_text: "Pilih Kantin / Vendor:",
        question_type: "radio",
        options_json: ["Kantin A (Bu Ratna)", "Kantin B (Bu Saminem)", "Kantin C (Bu Sumini)", "Catering / Vendor"],
        is_required: true
      };
    }
  }

  // Filter rating questions so that ANY question starting with "Pilih" is EXCLUDED from rating questions!
  const ratingQuestions = questions.filter(q => 
    q.question_type === "radio" && 
    !q.question_text.toLowerCase().startsWith("pilih")
  );
  
  const satisfactionQuestion = questions.find(q => q.question_type === "star");
  const feedbackQuestions = questions.filter(q => q.question_type === "text");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate target selection if target question exists
    if (targetQuestion) {
      const selectedVal = answers[targetQuestion.id];
      if (!selectedVal) {
        setError(`Silakan lengkapi pilihan "${targetQuestion.question_text}" terlebih dahulu.`);
        setSubmitting(false);
        return;
      }
      if (selectedVal === "Lainnya..." && !customTargetText.trim()) {
        setError("Silakan isi nama / keterangan lainnya.");
        setSubmitting(false);
        return;
      }
    }

    // Validate required questions
    for (const q of questions) {
      // Skip target question as it is handled separately
      if (q.question_text.toLowerCase().startsWith("pilih")) continue;
      const ans = answers[q.id];
      if (q.is_required && (!ans || ans.toString().trim() === "")) {
        setError(`Pertanyaan "${q.question_text}" wajib diisi.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const respondentName = sessionStorage.getItem("pekerjaan") || "Anonim";
      const finalTargetValue = targetQuestion 
        ? (answers[targetQuestion.id] === "Lainnya..." ? customTargetText : answers[targetQuestion.id]?.toString())
        : null;

      // 1. Insert Response
      const { data: respData, error: respErr } = await supabase.from("responses").insert([{
        service_id: id,
        respondent_name: respondentName,
        vendor_name: finalTargetValue
      }]).select().single();

      if (respErr) throw respErr;

      // 2. Insert Answers
      const answerInserts = Object.keys(answers)
        .filter(qId => !qId.startsWith("fallback-"))
        .map(qId => {
          let val = answers[qId].toString();
          if (qId === targetQuestion?.id && val === "Lainnya...") {
            val = customTargetText;
          }
          return {
            response_id: respData.id,
            question_id: qId,
            answer_value: val
          };
        });

      if (answerInserts.length > 0) {
        const { error: ansErr } = await supabase.from("answers").insert(answerInserts);
        if (ansErr) throw ansErr;
      }

      router.replace("/success");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim kuesioner.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500 font-medium">Memuat formulir...</div>;
  if (error && !service) return <div className="text-center py-10 text-red-500 font-medium">{error}</div>;

  const sectionPrefix = isDriver ? "A." : isKantin ? "B." : isSecurity ? "C." : "";
  const sectionTitle = isDriver ? "Penilaian Layanan Driver/ Transport" : isKantin ? "Penilaian Layanan Kantin / Catering" : isSecurity ? "Penilaian Layanan Security" : "Penilaian Layanan";

  // Prevent double "LAYANAN LAYANAN" in title
  const serviceTitle = service?.name?.toLowerCase().startsWith("layanan")
    ? `KUESIONER KEPUASAN ${service?.name?.toUpperCase()}`
    : `KUESIONER KEPUASAN LAYANAN ${service?.name?.toUpperCase()}`;

  return (
    <div className="py-4 max-w-3xl mx-auto font-sans">
      <h1 className="text-xl font-bold text-slate-800 mb-2 underline text-center uppercase">
        {serviceTitle}
      </h1>
      
      <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl mb-6 mt-4">
        <h2 className="font-semibold text-slate-800 mb-1">Tujuan :</h2>
        <p className="text-sm text-slate-700 mb-3">
          {service?.tujuan || `Untuk mengetahui tingkat kepuasan pengguna terhadap ${service?.name} serta mendapatkan masukan untuk peningkatan kualitas pelayanan.`}
        </p>
        <h2 className="font-semibold text-slate-800 mb-1">Petunjuk Pengisian :</h2>
        <p className="text-sm text-slate-700">
          {service?.petunjuk || `Berikan penilaian sesuai pengalaman Anda menggunakan ${service?.name}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* 1. Target Selection block (Pilih Driver / Vendor / Pos) - APPEARS EXACTLY ONCE */}
        {targetQuestion && (
          <div className="flex flex-col gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
            <label className="text-sm font-semibold text-slate-800">
              {targetQuestion.question_text} {targetQuestion.is_required && <span className="text-red-500">*</span>}
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(targetQuestion.options_json || []).map((opt: string) => {
                const isSelected = answers[targetQuestion.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? isKantin 
                          ? "border-orange-500 bg-orange-50"
                          : "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0 ${
                      isSelected 
                        ? isKantin ? 'border-orange-500' : 'border-blue-500' 
                        : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <div className={`w-2.5 h-2.5 rounded-full ${isKantin ? 'bg-orange-500' : 'bg-blue-600'}`} />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleAnswerChange(targetQuestion.id, opt)}
                    />
                    <span className={`text-sm font-medium ${
                      isSelected 
                        ? isKantin ? 'text-orange-955' : 'text-blue-900' 
                        : 'text-slate-700'
                    }`}>{opt}</span>
                  </label>
                );
              })}
            </div>

            {answers[targetQuestion.id] === "Lainnya..." && (
              <input
                type="text"
                placeholder="Tuliskan nama / pilihan lainnya di sini..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all mt-1"
                value={customTargetText}
                onChange={(e) => setCustomTargetText(e.target.value)}
                required
              />
            )}
          </div>
        )}

        <div className="mt-2">
          {/* Skala Penilaian Info */}
          <div className="mb-4">
            <h2 className="font-bold text-slate-800">Skala Penilaian : Nilai</h2>
            <p className="text-xs text-slate-600">Keterangan :<br/>4 - Sangat Baik ; 3 - Baik ; 2 - Kurang Baik ; 1 - Tidak Baik</p>
          </div>

          {/* Section Header */}
          <div className="mb-4 mt-2">
            <h2 className="font-bold text-slate-800">{sectionPrefix} {sectionTitle}</h2>
          </div>

          {/* Rating Cards - ONLY REAL RATING QUESTIONS */}
          <div className="flex flex-col gap-4">
            {ratingQuestions.map((q) => {
              const { title, subtitle } = parseQuestionText(q.question_text);
              return (
                <RadioScale 
                  key={q.id}
                  label={title}
                  subtitle={subtitle}
                  value={String(answers[q.id] || "")}
                  options={q.options_json}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                />
              );
            })}
          </div>
        </div>

        {/* 2. Overall Satisfaction Card (Bintang 1-5) */}
        {satisfactionQuestion && (
          <div className="border-t pt-6 pb-2">
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs">
              <h2 className="font-bold text-slate-800 mb-2">{satisfactionQuestion.question_text}</h2>
              <p className="text-sm text-slate-600 mb-4">
                Secara keseluruhan, bagaimana kepuasan Anda terhadap layanan {service?.name}?
              </p>
              <div className="flex">
                <StarRating 
                  value={Number(answers[satisfactionQuestion.id] || 0)} 
                  onChange={(val: number) => handleAnswerChange(satisfactionQuestion.id, val)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Masukan dan Saran (Textareas) */}
        {feedbackQuestions.length > 0 && (
          <div className="border-t pt-6 flex flex-col gap-4">
            <h2 className="font-bold text-slate-800">Masukan dan Saran</h2>
            
            {feedbackQuestions.map((q) => (
              <div key={q.id} className="flex flex-col gap-2 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
                <label className="text-sm font-medium text-slate-700">{q.question_text}</label>
                <textarea 
                  rows={3}
                  value={String(answers[q.id] || "")}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                  placeholder={
                    q.question_text.toLowerCase().includes("baik")
                      ? "Tuliskan masukan positif Anda di sini..."
                      : q.question_text.toLowerCase().includes("perbaiki")
                      ? "Tuliskan saran perbaikan Anda di sini..."
                      : "Tuliskan masukan Anda di sini..."
                  }
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] mt-4"
        >
          {submitting ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
