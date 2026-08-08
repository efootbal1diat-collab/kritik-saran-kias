-- HAPUS TABEL LAMA (Jika ada)
DROP TABLE IF EXISTS public.survey_pengemudi CASCADE;
DROP TABLE IF EXISTS public.survey_kantin CASCADE;
DROP TABLE IF EXISTS public.survey_security CASCADE;
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;

-- 1. Tabel Layanan (Forms)
CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    icon_type text DEFAULT 'Car',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Pertanyaan (Questions)
CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    question_type text NOT NULL, -- 'star', 'radio', 'text'
    options_json jsonb, -- Untuk pilihan ganda e.g. ["Baik", "Buruk"]
    order_number integer DEFAULT 0,
    is_required boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Respon (Sesuai Permintaan GA: Data Karyawan, Vendor, Periode, Keluhan)
CREATE TABLE public.responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    respondent_name text, -- Data Karyawan
    vendor_name text, -- Data Vendor (Nama Supir/Kantin/Security)
    feedback_text text, -- Komentar / Keluhan Utama
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL -- Periode Penilaian
);

-- 4. Tabel Jawaban (Hanya Nilai Indikator)
CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id uuid REFERENCES public.responses(id) ON DELETE CASCADE,
    question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_value text NOT NULL, -- Nilai Indikator (1-5 / Teks)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Pengaturan Admin
CREATE TABLE public.admin_settings (
    id integer PRIMARY KEY DEFAULT 1,
    admin_password text NOT NULL DEFAULT 'admin123',
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menambahkan Password Default
INSERT INTO public.admin_settings (id, admin_password) VALUES (1, 'admin123') ON CONFLICT (id) DO NOTHING;
