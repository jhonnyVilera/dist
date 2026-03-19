
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
    console.log('--- ASSET GUARDIAN AUDIT ---');
    
    const { data: levels, error } = await supabase
        .from('retos_niveles')
        .select('nivel_id, truco')
        .order('nivel_id', { ascending: true });

    if (error) {
        console.error('Error fetching levels:', error);
        return;
    }

    const voDir = path.join(process.cwd(), 'assets', 'audio', 'vo');
    
    const results = levels.map(level => {
        const world = level.nivel_id <= 10 ? 1 : 2;
        const audioFile = `mia_v${world}_n${level.nivel_id}.mp3`;
        const audioPath = path.join(voDir, audioFile);
        const hasAudio = fs.existsSync(audioPath);
        const hasTruco = level.truco && level.truco.trim().length > 0;

        return {
            nivel: level.nivel_id,
            audio: hasAudio ? '✅' : '❌ MISSING',
            truco: hasTruco ? '✅' : '❌ MISSING',
            status: (hasAudio && hasTruco) ? 'OK' : 'INCOMPLETE'
        };
    });

    console.table(results);
}

runAudit();
