import { createClient } from '@supabase/supabase-js'
import { obtenerRetoFallback } from './retos_fallback.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[DB] Supabase credentials missing in .env - Usando modo offline')
}

// Client configuration with persistence (using default localStorage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})

// =====================================================
// Cache local del perfil para evitar llamadas innecesarias
// =====================================================
let cachedProfile = null
const PROFILE_CACHE_KEY = 'mia_profile_cache'

function getCachedProfile() {
    if (cachedProfile) return cachedProfile
    try {
        const stored = localStorage.getItem(PROFILE_CACHE_KEY)
        if (stored) {
            cachedProfile = JSON.parse(stored)
            return cachedProfile
        }
    } catch (e) {}
    return null
}

export function setCachedProfile(profile) {
    cachedProfile = profile
    try {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
    } catch (e) {}
}

/**
 * Obtener los datos del perfil de Mía
 * Si no existe, crea uno nuevo con valores por defecto
 * OPTIMIZADO: Usa cache local pero compara con DB al inicio
 */
export async function obtenerPerfil(forceRefresh = false) {
    try {
        // 🚀 Si se fuerza refresh o no hay cache, obtener de DB
        if (forceRefresh || !getCachedProfile()) {
            let { data, error } = await supabase
                .from('perfil_jugador')
                .select('*')
                .limit(1)
                .single()

            if (error) {
                // Si no hay perfil, crear uno nuevo
                if (error.code === 'PGRST116') {
                    console.log('[DB] Creando perfil de jugador por defecto...')
                    const { data: newProfile, error: createError } = await supabase
                        .from('perfil_jugador')
                        .insert([{
                            nombre: 'MÍA',
                            nivel_actual: 1,
                            puntos_totales: '0'
                        }])
                        .select()
                        .single()

                    if (createError) throw createError
                    
                    // Guardar en cache
                    if (newProfile) {
                        setCachedProfile(newProfile)
                    }
                    return { success: true, data: newProfile }
                }
                throw error
            }

            // Guardar en cache local
            if (data) {
                setCachedProfile(data)
            }

            return { success: true, data }
        }
        
        // Usar cache local si existe
        const cached = getCachedProfile()
        console.log('[DB] Perfil obtenido desde cache local')
        return { success: true, data: cached, fromCache: true }

    } catch (error) {
        console.error('Error obteniendo perfil:', error)
        
        // En caso de error, intentar usar cache como fallback
        const cached = getCachedProfile()
        if (cached) {
            console.warn('[DB] Usando cache como fallback tras error')
            return { success: true, data: cached, fromCache: true, fallback: true }
        }
        
        return { success: false, error: error.message }
    }
}

/**
 * Obtener todos los perfiles de jugadores
 */
export async function obtenerTodosPerfiles() {
    try {
        console.log('[DB] Intentando obtener perfiles...')
        const { data, error } = await supabase
            .from('perfil_jugador')
            .select('*')

        if (error) {
            console.error('[DB] Error de Supabase:', error)
            throw error
        }
        console.log('[DB] Perfiles encontrados:', data?.length, data)
        return { success: true, data: data || [] }
    } catch (error) {
        console.error('Error obteniendo perfiles:', error)
        return { success: false, error: error.message, data: [] }
    }
}

/**
 * Seleccionar un perfil específico por ID
 */
export async function seleccionarPerfil(perfilId) {
    try {
        const { data, error } = await supabase
            .from('perfil_jugador')
            .select('*')
            .eq('id', perfilId)
            .single()

        if (error) throw error
        
        if (data) {
            setCachedProfile(data)
        }
        
        return { success: true, data }
    } catch (error) {
        console.error('Error seleccionando perfil:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Crear perfil si no existe (función auxiliar)
 */
export async function crearPerfilSiNoExiste() {
    try {
        const perfil = await obtenerPerfil()
        if (!perfil.success || !perfil.data) {
            return await crearPerfil()
        }
        return perfil
    } catch (error) {
        console.error('Error al verificar/crear perfil:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Crear un nuevo perfil de jugador
 */
export async function crearPerfil() {
    try {
        const { data, error } = await supabase
            .from('perfil_jugador')
            .insert([{
                nombre: 'MÍA',
                nivel_actual: 1,
                puntos_totales: '0'
            }])
            .select()
            .single()

        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('Error creando perfil:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Actualizar el progreso (puntos y nivel) en tiempo real
 * OPTIMIZADO: Evita llamadas innecesarias al servidor
 */
export async function actualizarProgreso(puntos, nivel) {
    try {
        console.log(`[DB] Intentando guardar: Nivel ${nivel}, Puntos ${puntos}`)
        
        // 🚀 Obtener valores frescos de la DB para comparar
        let perfilId
        let nivelEnDB = 0
        let puntosEnDB = 0
        
        const { data: perfilData, error: perfilError } = await supabase
            .from('perfil_jugador')
            .select('*')
            .limit(1)
            .single()

        if (perfilError) {
            console.error('[DB] Error al obtener perfil:', perfilError.message)
            
            // Error específico de RLS
            if (perfilError.message.includes('row-level security') || perfilError.code === '42501') {
                console.error('[DB] ⚠️  RLS está bloqueando el acceso. Ejecuta el SQL de fix_rls.sql')
            }
            
            if (perfilError.code === 'PGRST116') {
                // No existe perfil, crear uno nuevo
                const nuevoPerfil = await crearPerfil()
                if (!nuevoPerfil.success) throw new Error('No se pudo crear el perfil')
                setCachedProfile(nuevoPerfil.data)
                return { success: true, data: nuevoPerfil.data }
            } else {
                throw perfilError
            }
        }
        
        // Usar valores de la DB
        perfilId = perfilData?.id
        nivelEnDB = parseInt(perfilData?.nivel_actual) || 0
        puntosEnDB = parseInt(perfilData?.puntos_totales) || 0
        setCachedProfile(perfilData)

        if (!perfilId) {
            console.warn('[DB] No se pudo obtener ID del perfil')
            return { success: false, error: 'No hay perfil' }
        }

        // Solo saltamos si ambos valores nuevos son menores o iguales (evitar regression)
        // Usar || para actualizar si cualquiera de los valores es mayor
        if (nivel <= nivelEnDB && puntos <= puntosEnDB) {
            console.log(`[DB] Progreso sin cambios (DB: ${nivelEnDB}/${puntosEnDB}, nuevo: ${nivel}/${puntos}), saltando`)
            return { success: true, data: perfilData, skipped: true }
        }

        // 🚀 Actualizar con los nuevos valores (siempre son mayores)
        const updateData = {
            puntos_totales: puntos.toString(),
            nivel_actual: nivel
        }

        console.log(`[DB] Actualizando en Supabase: Nivel ${nivel} | Puntos ${puntos}`)

        const { data, error } = await supabase
            .from('perfil_jugador')
            .update(updateData)
            .eq('id', perfilId)
            .select()
            .single()

        if (error) {
            console.error('[DB] Error al actualizar:', error.message)
            if (error.message.includes('row-level security') || error.code === '42501') {
                console.error('[DB] ⚠️  RLS está bloqueando. Ejecuta scripts/sql_fix_rls.sql')
            }
            throw error
        }
        
        // Actualizar cache local con los nuevos valores
        if (data) {
            setCachedProfile(data)
        }
        
        console.log(`[DB] ✅ Progreso actualizado: Nivel ${nivel}, Puntos ${puntos}`)
        return { success: true, data }

    } catch (error) {
        console.error('[DB] ❌ Error guardando progreso:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Obtener la configuración de los niveles
 */
export async function obtenerNivelesConfig() {
    try {
        const { data, error } = await supabase
            .from('niveles_config')
            .select('*')
            .order('numero_nivel', { ascending: true })

        if (error) throw error
        
        // Si no hay datos, devolver array vacío para fallback local
        if (!data || data.length === 0) {
            console.warn('[DB] No hay niveles configurados, usando fallback local')
            return { success: true, data: [] }
        }
        
        return { success: true, data }
    } catch (error) {
        console.error('Error obteniendo configuración de niveles:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Obtener un reto de un nivel específico
 */
export async function obtenerRetoNivel(nivel) {
    try {
        const { data, error } = await supabase
            .from('retos_niveles')
            .select('*')
            .eq('nivel_id', nivel)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                console.warn(`[DB] No hay reto para nivel ${nivel} en BD, usando fallback local`)
                return obtenerRetoFallback(nivel)
            }
            throw error
        }
        
        return { success: true, data }
    } catch (error) {
        console.warn(`[DB] Error de conexión, usando fallback local para nivel ${nivel}`)
        return obtenerRetoFallback(nivel)
    }
}

/**
 * Obtener todos los retos de un mundo específico
 */
export async function obtenerRetosPorMundo(mundoId) {
    try {
        const startLevel = mundoId === 1 ? 1 : mundoId === 2 ? 11 : 16
        const endLevel = mundoId === 1 ? 10 : mundoId === 2 ? 15 : 20

        const { data, error } = await supabase
            .from('retos_niveles')
            .select('*')
            .gte('nivel_id', startLevel)
            .lte('nivel_id', endLevel)
            .order('nivel_id', { ascending: true })

        if (error) throw error
        return { success: true, data: data || [] }
    } catch (error) {
        console.error(`Error obteniendo retos del mundo ${mundoId}:`, error)
        return { success: false, error: error.message }
    }
}

/**
 * Refrescar datos del perfil desde la base de datos
 * OPTIMIZADO: Actualiza el cache local
 */
export async function refrescarPerfil() {
    try {
        const { data, error } = await supabase
            .from('perfil_jugador')
            .select('*')
            .single()

        if (error) throw error
        
        // Actualizar cache
        if (data) {
            setCachedProfile(data)
        }
        
        return { success: true, data }
    } catch (error) {
        console.error('Error refrescando perfil:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Reiniciar progreso del jugador
 * OPTIMIZADO: Limpia cache y usa update optimizado
 */
export async function reiniciarProgreso() {
    try {
        // Obtener ID del perfil desde cache o DB
        let perfilId = getCachedProfile()?.id
        
        if (!perfilId) {
            let { data: perfilData, error: perfilError } = await supabase
                .from('perfil_jugador')
                .select('id')
                .single()

            if (perfilError) throw perfilError
            if (!perfilData) throw new Error('No se encontró perfil')
            perfilId = perfilData.id
        }

        const { error: updateError } = await supabase
            .from('perfil_jugador')
            .update({
                nivel_actual: 1,
                puntos_totales: '0'
            })
            .eq('id', perfilId)

        if (updateError) throw updateError

        // Limpiar cache local
        cachedProfile = null
        localStorage.removeItem(PROFILE_CACHE_KEY)

        console.log('[DB] Progreso reiniciado')
        return { success: true }

    } catch (error) {
        console.error('Error reiniciando progreso:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Limpiar cache local (útil para debugging o logout)
 */
export function limpiarCacheLocal() {
    cachedProfile = null
    localStorage.removeItem(PROFILE_CACHE_KEY)
    console.log('[DB] Cache local limpiado')
}

export default supabase
