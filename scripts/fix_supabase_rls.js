#!/usr/bin/env node
// Script para verificar y corregir RLS de Supabase
// Uso: node scripts/fix_supabase_rls.js

const https = require('https');

const SUPABASE_URL = 'https://hadbdxptdjtbldksbupl.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZGJkeHB0ZGp0Ymxka3NidXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODA4MDMsImV4cCI6MjA4ODc1NjgwM30.YNLh5YwDoHtdldxdqetUVjkcdUH9VFRB9mu6zYgjM8k';

// SQL para deshabilitar RLS y crear políticas públicas
const SQL_COMMANDS = `
-- =============================================
-- DESHABILITAR RLS PARA TODAS LAS TABLAS
-- =============================================
ALTER TABLE perfil_jugador DISABLE ROW LEVEL SECURITY;
ALTER TABLE niveles_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE retos_niveles DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS, usar estas políticas:
-- CREATE POLICY "public_access_perfil" ON perfil_jugador FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "public_access_niveles" ON niveles_config FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "public_access_retos" ON retos_niveles FOR ALL USING (true) WITH CHECK (true);
`;

async function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });
        
        const options = {
            hostname: SUPABASE_URL,
            path: '/rest/v1/rpc/exec_sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ raw: body });
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function checkTables() {
    console.log('🔍 Verificando tablas en Supabase...\n');
    
    const tables = ['perfil_jugador', 'niveles_config', 'retos_niveles'];
    
    for (const table of tables) {
        console.log(`📋 Verificando ${table}...`);
        
        // Intentar un SELECT
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`
                }
            });
            
            if (response.ok) {
                console.log(`   ✅ Acceso permitido a ${table}`);
            } else if (response.status === 403 || response.status === 401) {
                console.log(`   ❌ Acceso DENEGADO a ${table} (${response.status})`);
                console.log(`   💡 Necesitas deshabilitar RLS o crear políticas públicas`);
            } else {
                console.log(`   ⚠️  Estado: ${response.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📝 EJECUTA ESTE SQL EN SUPABASE DASHBOARD:');
    console.log('   Dashboard → SQL Editor → Ejecutar');
    console.log('='.repeat(50));
    console.log(SQL_COMMANDS);
}

checkTables().catch(console.error);
