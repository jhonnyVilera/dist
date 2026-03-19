require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixRLS() {
    console.log('=== VERIFICANDO RLS POLICIES ===\n');

    const tables = ['perfil_jugador', 'niveles_config', 'retos_niveles'];

    for (const table of tables) {
        console.log(`\n📋 Tabla: ${table}`);
        
        // 1. Verificar si RLS está habilitado
        const { data: rlsStatus, error: rlsError } = await supabase.rpc('pg_get_expr', { 
            expr: '(SELECT relrowsecurity FROM pg_class WHERE relname = $1)', 
            args: [table] 
        }).catch(() => ({ data: null }));

        // Verificar políticas existentes
        const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', table);

        if (policiesError) {
            console.log(`   ❌ Error al obtener políticas: ${policiesError.message}`);
            continue;
        }

        if (!policies || policies.length === 0) {
            console.log(`   ⚠️  NO HAY POLÍTICAS - RLS puede estar bloqueando acceso`);
        } else {
            console.log(`   ✅ Políticas encontradas: ${policies.length}`);
            policies.forEach(p => {
                console.log(`      - ${p.policyname} (${p.cmd})`);
            });
        }
    }

    // Intentar deshabilitar RLS para las tablas
    console.log('\n=== INTENTANDO DESHABILITAR RLS ===\n');
    
    // Primero, verificar si podemos ejecutar SQL directo
    const { data: testData, error: testError } = await supabase
        .from('perfil_jugador')
        .select('*')
        .limit(1);

    if (testError) {
        console.log(`❌ Error al acceder a perfil_jugador: ${testError.message}`);
        
        // Intentar deshabilitar RLS
        console.log('\n🔧 Deshabilitando RLS...');
        
        const disableRLS = async (table) => {
            try {
                // Intentar actualizar directamente
                console.log(`   Verificando acceso a ${table}...`);
            } catch (e) {
                console.log(`   ❌ ${table}: ${e.message}`);
            }
        };
        
        await disableRLS('perfil_jugador');
        await disableRLS('niveles_config');
        await disableRLS('retos_niveles');
        
        console.log('\n⚠️  Las RLS policies están bloqueando el acceso.');
        console.log('📝 Ejecuta este SQL en el Editor SQL de Supabase:\n');
        
        console.log(`
-- Deshabilitar RLS para todas las tablas
ALTER TABLE perfil_jugador DISABLE ROW LEVEL SECURITY;
ALTER TABLE niveles_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE retos_niveles DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS, crear políticas públicas:
CREATE POLICY "Allow all access perfil_jugador" ON perfil_jugador
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access niveles_config" ON niveles_config
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access retos_niveles" ON retos_niveles
    FOR ALL USING (true) WITH CHECK (true);
`);
        
    } else {
        console.log('✅ Acceso a tablas exitoso - RLS no está bloqueando');
    }
}

checkAndFixRLS();
