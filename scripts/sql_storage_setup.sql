-- =====================================================
-- EL MUNDO DE MÍA - SUPABASE STORAGE SETUP
-- Bucket para Audio y Recursos
-- =====================================================
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Crear bucket público para audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio',
    'audio',
    true,
    52428800,  -- 50MB límite
    ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear bucket público para videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'video',
    'video',
    true,
    104857600,  -- 100MB límite
    ARRAY['video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Crear bucket público para imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'imagenes',
    'imagenes',
    true,
    10485760,  -- 10MB límite
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de acceso público (LECTURA)
-- Audio público
CREATE POLICY "Public audio access" ON storage.objects
    FOR SELECT USING (bucket_id = 'audio');

-- Video público  
CREATE POLICY "Public video access" ON storage.objects
    FOR SELECT USING (bucket_id = 'video');

-- Imágenes público
CREATE POLICY "Public imagenes access" ON storage.objects
    FOR SELECT USING (bucket_id = 'imagenes');

-- 5. Políticas de acceso para ESCRIBIR (servicio)
-- Estas políticas permiten upload desde el cliente
-- IMPORTANTE: En producción, limita esto más

-- Audio -允许 uploads
CREATE POLICY "Allow audio uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow audio updates" ON storage.objects
    FOR UPDATE USING (bucket_id = 'audio');

-- Video -允许 uploads
CREATE POLICY "Allow video uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'video');

CREATE POLICY "Allow video updates" ON storage.objects
    FOR UPDATE USING (bucket_id = 'video');

-- Imágenes -允许 uploads
CREATE POLICY "Allow imagenes uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'imagenes');

CREATE POLICY "Allow imagenes updates" ON storage.objects
    FOR UPDATE USING (bucket_id = 'imagenes');

-- 6. Verificar buckets creados
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE name IN ('audio', 'video', 'imagenes');

-- 7. Listar archivos en audio bucket (corregido)
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'audio'
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- INSTRUCCIONES PARA SUBIR ARCHIVOS:
-- =====================================================
-- 1. Ve a Supabase Dashboard → Storage
-- 2. Selecciona el bucket "audio"
-- 3. Click en "Upload" y sube tus archivos MP3
-- 4. Los archivos deberán estar en la raíz del bucket
-- 
-- Estructura esperada:
-- audio/
--   ├── mia_bienvenida.mp3
--   ├── mia_nivel_1.mp3
--   ├── mia_nivel_2.mp3
--   └── ... (todos los archivos de audio)
-- =====================================================
