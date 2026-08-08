-- SQL SCRIPT UNTUK MENG-UPDATE SELURUH TABEL SURVEY SESUAI GUIDANCE TERBARU (DRIVER, KANTIN, SECURITY)

-- 1. TABEL SURVEY PENGEMUDI / DRIVER
DROP TABLE IF EXISTS public.survey_pengemudi CASCADE;
CREATE TABLE public.survey_pengemudi (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    pekerjaan text,
    nama_pengemudi text NOT NULL,
    ketepatan_waktu integer NOT NULL,
    keselamatan_berkendara integer NOT NULL,
    kondisi_kendaraan integer NOT NULL,
    sikap_driver integer NOT NULL,
    kepatuhan_aturan integer NOT NULL,
    respons_pengguna integer NOT NULL,
    komunikasi integer NOT NULL,
    kepuasan_keseluruhan integer NOT NULL,
    saran_baik text,
    saran_perbaikan text
);

-- 2. TABEL SURVEY KANTIN / CATERING
DROP TABLE IF EXISTS public.survey_kantin CASCADE;
CREATE TABLE public.survey_kantin (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    pekerjaan text,
    nama_kantin text NOT NULL,
    kualitas_rasa integer NOT NULL,
    kebersihan_higiene integer NOT NULL,
    variasi_menu integer NOT NULL,
    porsi_makanan integer NOT NULL,
    ketepatan_waktu integer NOT NULL,
    kebersihan_area integer NOT NULL,
    sikap_petugas integer NOT NULL,
    respons_masukan integer NOT NULL,
    kepuasan_keseluruhan integer NOT NULL,
    saran_baik text,
    saran_perbaikan text
);

-- 3. TABEL SURVEY SECURITY
DROP TABLE IF EXISTS public.survey_security CASCADE;
CREATE TABLE public.survey_security (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    pekerjaan text,
    nama_security text NOT NULL,
    sikap_petugas integer NOT NULL,
    respons_pelayanan integer NOT NULL,
    rasa_aman integer NOT NULL,
    ketegasan_kedisiplinan integer NOT NULL,
    kontrol_akses integer NOT NULL,
    penanganan_kejadian integer NOT NULL,
    kepatuhan_sop integer NOT NULL,
    komunikasi integer NOT NULL,
    kepuasan_keseluruhan integer NOT NULL,
    saran_baik text,
    saran_perbaikan text
);
