-- Schema for Aplikasi Kritik dan Saran

-- Tabel Survey Pengemudi
CREATE TABLE public.survey_pengemudi (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    pekerjaan text,
    nama_pengemudi text NOT NULL,
    keselamatan text NOT NULL,
    komunikasi text NOT NULL,
    ketepatan_waktu text NOT NULL,
    kebersihan text NOT NULL,
    kepuasan_keseluruhan text NOT NULL,
    saran text
);

-- Tabel Survey Kantin
CREATE TABLE public.survey_kantin (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    pekerjaan text,
    nama_kantin text NOT NULL,
    rasa_makanan integer NOT NULL,
    porsi_makanan integer NOT NULL,
    variasi_menu integer NOT NULL,
    kondisi_makanan integer NOT NULL,
    kebersihan_area integer NOT NULL,
    kebersihan_alat integer NOT NULL,
    kebersihan_petugas integer NOT NULL,
    keramahan_petugas integer NOT NULL,
    kecepatan_pelayanan integer NOT NULL,
    harga integer NOT NULL,
    menu_favorit text,
    saran text
);

-- Tabel Survey Security
CREATE TABLE public.survey_security (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    pekerjaan text,
    nama_security text NOT NULL,
    ramah_sopan integer NOT NULL,
    siaga_disiplin integer NOT NULL,
    tegas_humanis integer NOT NULL,
    rutinitas_patroli integer NOT NULL,
    kesiagaan_pos integer NOT NULL,
    tanggap_darurat integer NOT NULL,
    arah_lalu_lintas integer NOT NULL,
    saran text
);
