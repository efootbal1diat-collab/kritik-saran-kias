"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, BarChart3, LogOut, Menu, X, Inbox, Car, Utensils, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ensureServicesSeeded } from "@/lib/seedServices";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ServiceItem {
  id: string;
  name: string;
  icon_type: string;
  is_system?: boolean;
}

interface ComplaintItem {
  id: string;
  category: string;
  badgeBg: string;
  badgeText: string;
  text: string;
  date: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeServiceId, setActiveServiceId] = useState<string>("");

  // Dynamic Metrics State
  const [totalRespondents, setTotalRespondents] = useState(0);
  const [overallAvg, setOverallAvg] = useState(0);
  
  // Indicator breakdown
  const [indicatorLabels, setIndicatorLabels] = useState<string[]>([]);
  const [indicatorScores, setIndicatorScores] = useState<number[]>([]);
  
  const [realComplaints, setRealComplaints] = useState<ComplaintItem[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
      fetchServices();
    }
  }, [router]);

  useEffect(() => {
    if (activeServiceId) {
      fetchServiceMetrics(activeServiceId);
    }
  }, [activeServiceId]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      await ensureServicesSeeded();

      const { data, error } = await supabase
        .from("services")
        .select("id, name, icon_type")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (!error && data) {
        // Sort system services first
        const sorted = [...data].sort((a, b) => {
          const order = ["Layanan Pengemudi", "Layanan Kantin / Catering", "Layanan Security"];
          const idxA = order.indexOf(a.name);
          const idxB = order.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        setServices(sorted);
        if (sorted.length > 0 && !activeServiceId) {
          setActiveServiceId(sorted[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceMetrics = async (serviceId: string) => {
    try {
      const activeObj = services.find(s => s.id === serviceId);
      const serviceName = activeObj?.name || "Layanan";

      const complaintsList: ComplaintItem[] = [];

      // 1. Fetch Dynamic Responses & Answers from DB
      const { data: responses } = await supabase
        .from("responses")
        .select("id, respondent_name, vendor_name, created_at")
        .eq("service_id", serviceId);

      const responseIds = responses ? responses.map(r => r.id) : [];

      // Fetch questions
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("service_id", serviceId)
        .order("order_number", { ascending: true });

      let dynamicScores: number[] = [];
      let dynamicLabels: string[] = [];
      let totalDynamicOverallSum = 0;
      let totalDynamicOverallCount = 0;

      if (questions && responseIds.length > 0) {
        const { data: answers } = await supabase
          .from("answers")
          .select("*")
          .in("response_id", responseIds);

        const allAnswers = answers || [];

        // Rating questions
        const ratingQuestions = questions.filter(q => q.question_type === "radio" && !q.question_text.toLowerCase().startsWith("pilih"));
        
        ratingQuestions.forEach(q => {
          // Parse title for label
          const title = q.question_text.replace(/\s*\(.*?\)\s*/g, "").trim();
          dynamicLabels.push(title);

          const qAnswers = allAnswers.filter(a => a.question_id === q.id);
          if (qAnswers.length > 0) {
            // Numeric extraction: e.g. "4. Sangat Baik" -> 4
            let sum = 0;
            let count = 0;
            qAnswers.forEach(a => {
              const numMatch = a.answer_value.match(/^(\d)/);
              if (numMatch) {
                sum += parseInt(numMatch[1], 10);
                count++;
              }
            });
            const avg = count > 0 ? sum / count : 0;
            dynamicScores.push(Number(avg.toFixed(1)));
          } else {
            dynamicScores.push(0);
          }
        });

        // Star question for overall satisfaction
        const starQ = questions.find(q => q.question_type === "star");
        if (starQ) {
          const starAnswers = allAnswers.filter(a => a.question_id === starQ.id);
          starAnswers.forEach(a => {
            const val = parseFloat(a.answer_value);
            if (!isNaN(val)) {
              totalDynamicOverallSum += val;
              totalDynamicOverallCount++;
            }
          });
        }

        // Text questions for complaints/feedbacks
        const textQuestions = questions.filter(q => q.question_type === "text");
        textQuestions.forEach(q => {
          const tAnswers = allAnswers.filter(a => a.question_id === q.id);
          tAnswers.forEach((a, idx) => {
            if (a.answer_value && a.answer_value.trim().length > 0) {
              const resp = (responses || []).find(r => r.id === a.response_id);
              complaintsList.push({
                id: `dyn-${a.id || idx}`,
                category: serviceName,
                badgeBg: "bg-blue-100 text-blue-700",
                badgeText: resp?.vendor_name || resp?.respondent_name || "Responden",
                text: a.answer_value,
                date: a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "Baru saja",
              });
            }
          });
        });
      }

      // Check legacy table fallback if applicable
      let legacyCount = 0;
      let legacyOverallSum = 0;
      let legacyOverallCount = 0;

      if (serviceName.includes("Pengemudi") || serviceName.includes("Driver")) {
        const { data: legacyData } = await supabase.from("survey_pengemudi").select("*");
        if (legacyData && legacyData.length > 0) {
          legacyCount = legacyData.length;
          legacyData.forEach((item, idx) => {
            if (item.kepuasan_keseluruhan) {
              legacyOverallSum += item.kepuasan_keseluruhan;
              legacyOverallCount++;
            }
            if (item.saran_perbaikan && item.saran_perbaikan.trim().length > 0) {
              complaintsList.push({
                id: `leg-drv-${idx}`,
                category: serviceName,
                badgeBg: "bg-blue-100 text-blue-700",
                badgeText: item.nama_pengemudi || "Pengemudi",
                text: item.saran_perbaikan,
                date: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "Baru saja",
              });
            }
          });
        }
      } else if (serviceName.includes("Kantin") || serviceName.includes("Catering")) {
        const { data: legacyData } = await supabase.from("survey_kantin").select("*");
        if (legacyData && legacyData.length > 0) {
          legacyCount = legacyData.length;
          legacyData.forEach((item, idx) => {
            if (item.kepuasan_keseluruhan) {
              legacyOverallSum += item.kepuasan_keseluruhan;
              legacyOverallCount++;
            }
            if (item.saran_perbaikan && item.saran_perbaikan.trim().length > 0) {
              complaintsList.push({
                id: `leg-ktn-${idx}`,
                category: serviceName,
                badgeBg: "bg-amber-100 text-amber-800",
                badgeText: item.nama_kantin || "Kantin",
                text: item.saran_perbaikan,
                date: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "Baru saja",
              });
            }
          });
        }
      } else if (serviceName.includes("Security")) {
        const { data: legacyData } = await supabase.from("survey_security").select("*");
        if (legacyData && legacyData.length > 0) {
          legacyCount = legacyData.length;
          legacyData.forEach((item, idx) => {
            if (item.kepuasan_keseluruhan) {
              legacyOverallSum += item.kepuasan_keseluruhan;
              legacyOverallCount++;
            }
            if (item.saran_perbaikan && item.saran_perbaikan.trim().length > 0) {
              complaintsList.push({
                id: `leg-sec-${idx}`,
                category: serviceName,
                badgeBg: "bg-emerald-100 text-emerald-800",
                badgeText: item.pos_security || "Security",
                text: item.saran_perbaikan,
                date: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "Baru saja",
              });
            }
          });
        }
      }

      const totalCount = responseIds.length + legacyCount;
      setTotalRespondents(totalCount);

      const combinedOverallSum = totalDynamicOverallSum + legacyOverallSum;
      const combinedOverallCount = totalDynamicOverallCount + legacyOverallCount;
      const overallAverage = combinedOverallCount > 0 ? Number((combinedOverallSum / combinedOverallCount).toFixed(1)) : 0;
      setOverallAvg(overallAverage);

      setIndicatorLabels(dynamicLabels);
      setIndicatorScores(dynamicScores);
      setRealComplaints(complaintsList);

    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const renderIcon = (iconStr: string) => {
    if (iconStr === "Car") return "🚐";
    if (iconStr === "Utensils") return "🍱";
    if (iconStr === "ShieldCheck") return "🛡️";
    return "📋";
  };

  const renderLargeIcon = (iconStr: string) => {
    if (iconStr === "Car") return <Car className="w-6 h-6 text-blue-600" />;
    if (iconStr === "Utensils") return <Utensils className="w-6 h-6 text-blue-600" />;
    if (iconStr === "ShieldCheck") return <ShieldCheck className="w-6 h-6 text-blue-600" />;
    return <AlertCircle className="w-6 h-6 text-blue-600" />;
  };

  const getRatingLabel = (score: number, count: number) => {
    if (count === 0) return "(Belum ada data)";
    if (score >= 4.3) return "⭐⭐⭐⭐⭐ (Sangat Baik)";
    if (score >= 3.8) return "⭐⭐⭐⭐ (Baik)";
    if (score >= 3.0) return "⭐⭐⭐ (Cukup)";
    return "⭐⭐ (Kurang)";
  };

  const activeServiceObj = services.find(s => s.id === activeServiceId) || services[0];
  const activeName = activeServiceObj?.name || "Layanan";
  const hasData = totalRespondents > 0 && indicatorScores.length > 0;

  const minScore = hasData ? Math.min(...indicatorScores.filter(s => s > 0)) : 0;
  const maxScore = hasData ? Math.max(...indicatorScores.filter(s => s > 0)) : 0;
  const isTiedAllEqual = minScore === maxScore;

  const minIndex = hasData ? indicatorScores.indexOf(minScore) : -1;
  const lowestIndicatorName = minIndex >= 0 ? indicatorLabels[minIndex] : "";

  // Horizontal Bar Chart Config
  const barChartData = {
    labels: indicatorLabels,
    datasets: [
      {
        label: "Skor Rata-Rata",
        data: hasData ? indicatorScores : indicatorLabels.map(() => 0),
        backgroundColor: indicatorScores.map((score) =>
          !isTiedAllEqual && score === minScore && score > 0
            ? "rgba(239, 68, 68, 0.85)"
            : "rgba(59, 130, 246, 0.85)"
        ),
        borderColor: indicatorScores.map((score) =>
          !isTiedAllEqual && score === minScore && score > 0
            ? "rgb(239, 68, 68)"
            : "rgb(59, 130, 246)"
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions: any = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 5,
        grid: { display: true },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  // Line Chart Config (Real DB Average for current period)
  const lineChartData = {
    labels: ["Agustus 2026"],
    datasets: [
      {
        label: `Rating ${activeName}`,
        data: [overallAvg],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: "rgb(16, 185, 129)",
      },
    ],
  };

  const lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 5.0,
        grid: { display: true },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  if (!isAuth) return null;

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
            className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors"
          >
            <LayoutDashboard className="mr-3 w-5 h-5" />
            Dashboard Utama
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors"
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
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Layanan GA</h1>
              <p className="text-sm text-gray-500">
                100% Dynamic Engine & Control
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Active
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Dynamic Tab Selector */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-gray-700 shrink-0">Pilih Layanan GA:</span>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <span className="text-sm text-gray-400">Memuat layanan...</span>
              ) : (
                services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveServiceId(service.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeServiceId === service.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{renderIcon(service.icon_type)}</span> {service.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 1. Ringkasan Kepuasan Layanan */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                1. Ringkasan Kepuasan {activeName}
              </h2>
              <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                Live Data Overview
              </span>
            </div>
            
            <div className="max-w-sm">
              <div
                className="p-5 rounded-xl border border-blue-500 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                      <span>{renderIcon(activeServiceObj?.icon_type || "Car")}</span> {activeName}
                    </p>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                      {totalRespondents} Responden
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">
                    {totalRespondents > 0 ? overallAvg.toString().replace(".", ",") : "0,0"}
                  </h3>
                  <p className="text-xs text-amber-500 mt-1">{getRatingLabel(overallAvg, totalRespondents)}</p>
                </div>
                <div className="w-12 h-12 bg-white border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl shadow-xs">
                  {renderLargeIcon(activeServiceObj?.icon_type || "Car")}
                </div>
              </div>
            </div>
          </section>

          {/* Grid 2 Kolom untuk Grafik & Tren */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 2. Grafik Nilai Indikator (Dinamis dari Questions) */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  2. Nilai Indikator ({activeName})
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Rincian skor per pertanyaan rating (Otomatis menyesuaikan dengan kuesioner aktif).
                </p>

                {hasData ? (
                  <div className="h-64">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6 text-center">
                    <Inbox className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Belum Ada Data Penilaian</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Belum ada responden yang mengisi survey untuk layanan ini.
                    </p>
                  </div>
                )}
              </div>

              {hasData ? (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-900 text-sm rounded-r-lg">
                  <span className="font-semibold">💡 Catatan Manajemen:</span>{" "}
                  {isTiedAllEqual
                    ? `Seluruh indikator berada di tingkat nilai yang seimbang (skor rata-rata: ${minScore.toString().replace(".", ",")}).`
                    : `${lowestIndicatorName} menjadi prioritas perbaikan utama (skor terendah: ${minScore.toString().replace(".", ",")}).`}
                </div>
              ) : (
                <div className="mt-4 p-3 bg-gray-100 text-gray-600 text-sm rounded-lg">
                  <span className="font-semibold">💡 Catatan Manajemen:</span> Menunggu respon masuk dari pengguna.
                </div>
              )}
            </section>

            {/* 3. Tren Bulanan Rating */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  3. Tren Bulanan Rating
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Evaluasi perkembangan rating bulanan
                </p>

                {hasData ? (
                  <div className="h-64">
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6 text-center">
                    <Inbox className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Belum Ada Data Tren</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Grafik tren akan terbentuk secara otomatis seiring masuknya masukan responden.
                    </p>
                  </div>
                )}
              </div>

              {hasData ? (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-lg">
                  <span className="font-semibold">📈 Analisis Tren:</span> Rating rata-rata saat ini berada pada angka {overallAvg.toString().replace(".", ",")}.
                </div>
              ) : (
                <div className="mt-4 p-3 bg-gray-100 text-gray-600 text-sm rounded-lg">
                  <span className="font-semibold">📈 Analisis Tren:</span> Data tren belum tersedia.
                </div>
              )}
            </section>
          </div>

          {/* 4. Analisa Keluhan Real */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-gray-900">
                4. Analisa Keluhan & Masukan Teks
              </h2>
              <Link href="/admin/results" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat Semua Respon &rarr;
              </Link>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Otomatis ditarik dari seluruh masukan teks responden.
            </p>

            {realComplaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realComplaints.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${item.badgeBg}`}>
                        {item.badgeText}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">{item.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-3">&quot;{item.text}&quot;</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                <Inbox className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Belum Ada Keluhan / Jawaban Teks</p>
                <p className="text-xs text-gray-500 mt-1">
                  Setiap jawaban dari soal tipe teks akan otomatis tampil di sini.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-gray-400 border-t border-gray-200 mt-12">
          General Affairs Department &copy; 2026
        </footer>
      </main>
    </div>
  );
}
