import { supabase } from "@/lib/supabaseClient";

export async function ensureServicesSeeded() {
  try {
    // Check if services table already has entries
    const { count, error } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true });

    if (!error && count && count > 0) {
      // Services already exist in Supabase! Do NOT auto-reseed so user edits/renames are never duplicated.
      return;
    }

    const scaleOptions = ["4. Sangat Baik", "3. Baik", "2. Kurang Baik", "1. Tidak Baik"];

    // 1. Seed Driver Service
    console.log("Seeding initial Layanan Pengemudi...");
    const { data: driverSrv } = await supabase
      .from("services")
      .insert([{
        name: "Layanan Pengemudi",
        description: "Survey kepuasan layanan driver dan transport.",
        icon_type: "Car",
        is_active: true
      }])
      .select()
      .single();

    if (driverSrv) {
      await supabase.from("questions").insert([
        { service_id: driverSrv.id, question_text: "Pilih Driver:", question_type: "radio", options_json: ["Hanan", "Adhit", "Richard", "Boby", "Eric", "Abdur", "Sriyono", "Lainnya..."], order_number: 1, is_required: true },
        { service_id: driverSrv.id, question_text: "1. Ketepatan Waktu (Bagaimana ketepatan waktu kedatangan driver di titik penjemputan?)", question_type: "radio", options_json: scaleOptions, order_number: 2, is_required: true },
        { service_id: driverSrv.id, question_text: "2. Keselamatan Berkendara (Bagaimana Anda menilai keselamatan berkendara driver selama perjalanan?)", question_type: "radio", options_json: scaleOptions, order_number: 3, is_required: true },
        { service_id: driverSrv.id, question_text: "3. Kondisi Kendaraan (Bagaimana Anda menilai kondisi kendaraan yang digunakan?)", question_type: "radio", options_json: scaleOptions, order_number: 4, is_required: true },
        { service_id: driverSrv.id, question_text: "4. Sikap/Keramahan Driver (Bagaimana Anda menilai sikap dan keramahan driver?)", question_type: "radio", options_json: scaleOptions, order_number: 5, is_required: true },
        { service_id: driverSrv.id, question_text: "5. Kepatuhan Aturan (Bagaimana Anda menilai kepatuhan driver terhadap aturan?)", question_type: "radio", options_json: scaleOptions, order_number: 6, is_required: true },
        { service_id: driverSrv.id, question_text: "6. Respons Pengguna (Bagaimana respons driver terhadap kebutuhan pengguna?)", question_type: "radio", options_json: scaleOptions, order_number: 7, is_required: true },
        { service_id: driverSrv.id, question_text: "7. Komunikasi (Bagaimana komunikasi driver selama memberikan layanan?)", question_type: "radio", options_json: scaleOptions, order_number: 8, is_required: true },
        { service_id: driverSrv.id, question_text: "8. Kepuasan Keseluruhan", question_type: "star", order_number: 9, is_required: true },
        { service_id: driverSrv.id, question_text: "9. Hal yang sudah baik dan perlu dipertahankan", question_type: "text", order_number: 10, is_required: false },
        { service_id: driverSrv.id, question_text: "10. Hal yang perlu diperbaiki", question_type: "text", order_number: 11, is_required: false },
      ]);
    }

    // 2. Seed Kantin Service
    console.log("Seeding initial Layanan Kantin / Catering...");
    const { data: kantinSrv } = await supabase
      .from("services")
      .insert([{
        name: "Layanan Kantin / Catering",
        description: "Survey kepuasan kebersihan, kualitas rasa, dan pelayanan kantin.",
        icon_type: "Utensils",
        is_active: true
      }])
      .select()
      .single();

    if (kantinSrv) {
      await supabase.from("questions").insert([
        { service_id: kantinSrv.id, question_text: "Pilih Kantin / Vendor:", question_type: "radio", options_json: ["Kantin A (Bu Ratna)", "Kantin B (Bu Saminem)", "Kantin C (Bu Sumini)", "Catering / Vendor"], order_number: 1, is_required: true },
        { service_id: kantinSrv.id, question_text: "1. Kualitas Rasa Makanan (Bagaimana Anda menilai kualitas rasa makanan yang disediakan?)", question_type: "radio", options_json: scaleOptions, order_number: 2, is_required: true },
        { service_id: kantinSrv.id, question_text: "2. Kebersihan & Higiene Makanan (Bagaimana Anda menilai kebersihan makanan dan penyajiannya?)", question_type: "radio", options_json: scaleOptions, order_number: 3, is_required: true },
        { service_id: kantinSrv.id, question_text: "3. Variasi Menu (Bagaimana Anda menilai variasi menu yang tersedia?)", question_type: "radio", options_json: scaleOptions, order_number: 4, is_required: true },
        { service_id: kantinSrv.id, question_text: "4. Ketersediaan / Porsi Makanan (Bagaimana Anda menilai ketersediaan dan porsi makanan?)", question_type: "radio", options_json: scaleOptions, order_number: 5, is_required: true },
        { service_id: kantinSrv.id, question_text: "5. Ketepatan Waktu Pelayanan (Bagaimana Anda menilai ketepatan waktu penyediaan makanan?)", question_type: "radio", options_json: scaleOptions, order_number: 6, is_required: true },
        { service_id: kantinSrv.id, question_text: "6. Kebersihan Area Kantin (Bagaimana Anda menilai kebersihan dan kenyamanan area kantin?)", question_type: "radio", options_json: scaleOptions, order_number: 7, is_required: true },
        { service_id: kantinSrv.id, question_text: "7. Sikap Petugas Kantin/Catering (Bagaimana Anda menilai sikap dan keramahan petugas?)", question_type: "radio", options_json: scaleOptions, order_number: 8, is_required: true },
        { service_id: kantinSrv.id, question_text: "8. Respons terhadap Masukan (Bagaimana respons vendor terhadap masukan atau keluhan?)", question_type: "radio", options_json: scaleOptions, order_number: 9, is_required: true },
        { service_id: kantinSrv.id, question_text: "9. Kepuasan Keseluruhan", question_type: "star", order_number: 10, is_required: true },
        { service_id: kantinSrv.id, question_text: "10. Hal yang sudah baik dan perlu dipertahankan", question_type: "text", order_number: 11, is_required: false },
        { service_id: kantinSrv.id, question_text: "11. Hal yang perlu diperbaiki", question_type: "text", order_number: 12, is_required: false },
      ]);
    }

    // 3. Seed Security Service
    console.log("Seeding initial Layanan Security...");
    const { data: secSrv } = await supabase
      .from("services")
      .insert([{
        name: "Layanan Security",
        description: "Survey kepuasan profesionalisme dan tanggap darurat security.",
        icon_type: "ShieldCheck",
        is_active: true
      }])
      .select()
      .single();

    if (secSrv) {
      await supabase.from("questions").insert([
        { service_id: secSrv.id, question_text: "1. Keramahan & Sikap Petugas (Bagaimana Anda menilai sikap dan keramahan petugas security?)", question_type: "radio", options_json: scaleOptions, order_number: 1, is_required: true },
        { service_id: secSrv.id, question_text: "2. Respons Pelayanan (Bagaimana respons security terhadap kebutuhan atau permintaan pengguna?)", question_type: "radio", options_json: scaleOptions, order_number: 2, is_required: true },
        { service_id: secSrv.id, question_text: "3. Rasa Aman (Seberapa baik security memberikan rasa aman di area kerja?)", question_type: "radio", options_json: scaleOptions, order_number: 3, is_required: true },
        { service_id: secSrv.id, question_text: "4. Ketegasan & Kedisiplinan (Bagaimana Anda menilai ketegasan dan kedisiplinan security?)", question_type: "radio", options_json: scaleOptions, order_number: 4, is_required: true },
        { service_id: secSrv.id, question_text: "5. Kontrol Akses (Bagaimana Anda menilai pelaksanaan kontrol akses oleh security?)", question_type: "radio", options_json: scaleOptions, order_number: 5, is_required: true },
        { service_id: secSrv.id, question_text: "6. Penanganan Kejadian (Bagaimana Anda menilai kemampuan security menangani kejadian?)", question_type: "radio", options_json: scaleOptions, order_number: 6, is_required: true },
        { service_id: secSrv.id, question_text: "7. Kepatuhan SOP (Bagaimana Anda menilai kepatuhan security terhadap SOP?)", question_type: "radio", options_json: scaleOptions, order_number: 7, is_required: true },
        { service_id: secSrv.id, question_text: "8. Komunikasi (Bagaimana Anda menilai komunikasi petugas security?)", question_type: "radio", options_json: scaleOptions, order_number: 8, is_required: true },
        { service_id: secSrv.id, question_text: "9. Kepuasan Keseluruhan", question_type: "star", order_number: 9, is_required: true },
        { service_id: secSrv.id, question_text: "10. Hal yang sudah baik dan perlu dipertahankan", question_type: "text", order_number: 10, is_required: false },
        { service_id: secSrv.id, question_text: "11. Hal yang perlu diperbaiki", question_type: "text", order_number: 11, is_required: false },
      ]);
    }
  } catch (err) {
    console.error("Error in ensureServicesSeeded:", err);
  }
}
