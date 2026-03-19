-- =====================================================
-- EL MUNDO DE MÍA - CORRECCIÓN DE RLS POLICIES
-- =====================================================
-- Este script deshabilita Row Level Security para que 
-- la aplicación pueda acceder a las tablas correctamente.
--
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Deshabilitar RLS en todas las tablas
ALTER TABLE perfil_jugador DISABLE ROW LEVEL SECURITY;
ALTER TABLE niveles_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE retos_niveles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que las tablas estén accesibles
SELECT 'perfil_jugador' as tabla, count(*) as registros FROM perfil_jugador
UNION ALL
SELECT 'niveles_config', count(*) FROM niveles_config
UNION ALL
SELECT 'retos_niveles', count(*) FROM retos_niveles;

-- =====================================================
-- NOTA: Si prefieres MANTENER RLS activo,
-- descomenta las siguientes políticas:
-- =====================================================

-- CREATE POLICY "public_access_perfil" ON perfil_jugador 
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "public_access_niveles" ON niveles_config 
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "public_access_retos" ON retos_niveles 
--     FOR ALL USING (true) WITH CHECK (true);
