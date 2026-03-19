import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Bucket público para audio
const AUDIO_BUCKET = 'audio'

/**
 * Obtener URL pública de un archivo de audio
 */
export function getAudioUrl(filename) {
    const { data } = supabase.storage
        .from(AUDIO_BUCKET)
        .getPublicUrl(filename)
    
    return data?.publicUrl || null
}

/**
 * Lista de todos los archivos de audio disponibles
 */
export const AUDIO_FILES = {
    // Voces principales
    'mia_bienvenida.mp3': 'bienvenida',
    'mia_acierto.mp3': 'acierto', 
    'mia_error.mp3': 'error',
    'mia_lupa.mp3': 'lupa',
    
    // Niveles Mundo 1
    'mia_nivel_1.mp3': 'nivel_1',
    'mia_nivel_2.mp3': 'nivel_2',
    'mia_nivel_3.mp3': 'nivel_3',
    'mia_nivel_4.mp3': 'nivel_4',
    'mia_nivel_5.mp3': 'nivel_5',
    'mia_nivel_6.mp3': 'nivel_6',
    'mia_nivel_7.mp3': 'nivel_7',
    'mia_nivel_8.mp3': 'nivel_8',
    'mia_nivel_9.mp3': 'nivel_9',
    'mia_nivel_10.mp3': 'nivel_10',
    
    // Niveles Mundo 2
    'mia_nivel_11.mp3': 'nivel_11',
    'mia_nivel_12.mp3': 'nivel_12',
    'mia_nivel_13.mp3': 'nivel_13',
    'mia_nivel_14.mp3': 'nivel_14',
    'mia_nivel_15.mp3': 'nivel_15',
    
    // Niveles Mundo 3
    'mia_nivel_16.mp3': 'nivel_16',
    'mia_nivel_17.mp3': 'nivel_17',
    'mia_nivel_18.mp3': 'nivel_18',
    'mia_nivel_19.mp3': 'nivel_19',
    'mia_nivel_20.mp3': 'nivel_20',
    
    // Mundos completados
    'mia_mundo_1_completado.mp3': 'mundo_1_completado',
    'mia_mundo_2_bienvenida.mp3': 'mundo_2_bienvenida',
    'mia_mundo_2_completado.mp3': 'mundo_2_completado',
    'mia_mundo_3_bienvenida.mp3': 'mundo_3_bienvenida',
    'mia_mundo_3_completado.mp3': 'mundo_3_completado',
    
    // Música de fondo
    'The_Jungle.mp3': 'bgm_bosque',
    'ciudadCristal.mp3': 'bgm_ciudad',
    'afro_house_menu.mp3': 'bgm_menu'
}

/**
 * Obtener URL de audio desde Supabase Storage
 * Si falla, usa fallback local
 */
export async function getAudioUrlWithFallback(filename, localFallback = true) {
    try {
        const url = getAudioUrl(filename)
        if (url) {
            // Verificar que el archivo existe
            const response = await fetch(url, { method: 'HEAD' })
            if (response.ok) {
                console.log('[Audio] Cargando desde Storage:', filename)
                return url
            }
        }
    } catch (e) {
        console.warn('[Audio] Storage no disponible:', e.message)
    }
    
    // Fallback a archivo local
    if (localFallback) {
        console.log('[Audio] Usando fallback local:', filename)
        return `/assets/audio/${filename}`
    }
    
    return null
}

export default supabase
