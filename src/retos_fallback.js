/**
 * RETOS MATEMÁTICOS - EL MUNDO DE MÍA
 * 
 * Este archivo contiene las preguntas de fallback para cuando no hay conexión
 * a la base de datos de Supabase. Los niveles 11-20 corresponden a:
 * - Mundo 2: Ciudad de los Algoritmos de Cristal (Niveles 11-15)
 * - Mundo 3: Templo de Circuitos (Niveles 16-20)
 * 
 * Estas preguntas son de matemáticas para niños de 8-12 años.
 */

// ==========================================
// MUNDO 2: CIUDAD DE LOS ALGORITMOS DE CRISTAL
// Niveles 11-15 (Mayor dificultad, multiplicación, división)
// ==========================================

export const RETOS_MUNDO_2 = {
    11: {
        nivel_id: 11,
        tipo_reto: 'MULTIPLICACIÓN',
        pregunta: 'Si cada cohete lleva 7 cristales y tienes 8 cohetes, ¿cuántos cristales necesitas en total?',
        opciones: { a: '54', b: '56', c: '48', d: '64' },
        respuesta_correcta: 'b',
        explicacion: '¡Muy bien! 7 × 8 = 56 cristales en total. ¡Los cristales de colores son geniales!',
        truco: 'Multiplica el número de cristales por cohete × número de cohetes: 7 × 8 = 56',
        puntos_recompensa: 100
    },
    12: {
        nivel_id: 12,
        tipo_reto: 'DIVISIÓN',
        pregunta: 'Tienes 72 caramelos y los quieres repartir entre 9 amigos. ¿Cuántos caramelos le tocan a cada uno?',
        opciones: { a: '7', b: '8', c: '9', d: '6' },
        respuesta_correcta: 'b',
        explicacion: '¡Exacto! 72 ÷ 9 = 8 caramelos para cada amigo. ¡A todos les toca lo mismo!',
        truco: 'Divide los caramelos entre los amigos: 72 ÷ 9 = 8',
        puntos_recompensa: 100
    },
    13: {
        nivel_id: 13,
        tipo_reto: 'MULTIPLICACIÓN',
        pregunta: 'Un edificio tiene 6 pisos. Cada piso tiene 12 ventanas con luces de colores. ¿Cuántas ventanas hay en total?',
        opciones: { a: '68', b: '72', c: '78', d: '64' },
        respuesta_correcta: 'b',
        explicacion: '¡Perfecto! 6 × 12 = 72 ventanas brillantes. ¡La ciudad brilla con luz propia!',
        truco: 'Pisos × ventanas por piso = 6 × 12 = 72',
        puntos_recompensa: 100
    },
    14: {
        nivel_id: 14,
        tipo_reto: 'DIVISIÓN',
        pregunta: 'Mía tiene 84 estrellas de cristal y las coloca en 7 vitrinas. ¿Cuántas estrellas por vitrina?',
        opciones: { a: '11', b: '12', c: '13', d: '10' },
        respuesta_correcta: 'b',
        explicacion: '¡Genial! 84 ÷ 7 = 12 estrellas por vitrina. ¡Qué colección tan bonita!',
        truco: 'Divide las estrellas entre las vitrinas: 84 ÷ 7 = 12',
        puntos_recompensa: 100
    },
    15: {
        nivel_id: 15,
        tipo_reto: 'OPERACIÓN COMBINADA',
        pregunta: 'Si 5 × 8 = 40 y luego le sumas 25, ¿cuál es el resultado?',
        opciones: { a: '65', b: '55', c: '75', d: '45' },
        respuesta_correcta: 'a',
        explicacion: '¡Increíble! 5 × 8 = 40, más 25 = 65. ¡Eres un matemago de los cristales!',
        truco: 'Primero multiplica: 5 × 8 = 40, luego suma: 40 + 25 = 65',
        puntos_recompensa: 150
    }
}

// ==========================================
// MUNDO 3: TEMPLO DE CIRCUITOS
// Niveles 16-20 (Nivel máximo, problemas complejos)
// ==========================================

export const RETOS_MUNDO_3 = {
    16: {
        nivel_id: 16,
        tipo_reto: 'PROBLEMA',
        pregunta: 'Un robot puede procesar 9 datos por segundo. ¿Cuántos datos procesa en 1 minuto (60 segundos)?',
        opciones: { a: '540', b: '450', c: '504', d: '450' },
        respuesta_correcta: 'a',
        explicacion: '¡Excelente! 9 × 60 = 540 datos. ¡El robot es super rápido!',
        truco: 'Datos por segundo × segundos totales = 9 × 60 = 540',
        puntos_recompensa: 100
    },
    17: {
        nivel_id: 17,
        tipo_reto: 'SECUENCIA LÓGICA',
        pregunta: '¿Qué número sigue?: 3, 6, 12, 24, 48, ___',
        opciones: { a: '72', b: '96', c: '84', d: '64' },
        respuesta_correcta: 'b',
        explicacion: '¡Muy bien! Cada número se multiplica por 2: 48 × 2 = 96. ¡Los circuitos funcionan así!',
        truco: 'La secuencia duplica cada número: ×2 siempre',
        puntos_recompensa: 100
    },
    18: {
        nivel_id: 18,
        tipo_reto: 'PROBLEMA',
        pregunta: 'Mía tiene 150 circuitos y quiere hacer grupos de 6. ¿Cuántos grupos completos puede hacer?',
        opciones: { a: '20', b: '25', c: '24', d: '30' },
        respuesta_correcta: 'b',
        explicacion: '¡Perfecto! 150 ÷ 6 = 25 grupos. ¡Sobran 0 circuitos!',
        truco: 'Divide los circuitos entre el tamaño del grupo: 150 ÷ 6 = 25',
        puntos_recompensa: 100
    },
    19: {
        nivel_id: 19,
        tipo_reto: 'CÁLCULO',
        pregunta: 'Si (8 × 5) + (7 × 3) = ?',
        opciones: { a: '61', b: '68', c: '73', d: '58' },
        respuesta_correcta: 'a',
        explicacion: '¡Genial! 8 × 5 = 40, 7 × 3 = 21, total = 40 + 21 = 61. ¡Los circuitos suman!',
        truco: 'Primero multiplica: 8×5=40 y 7×3=21, luego suma: 40+21=61',
        puntos_recompensa: 100
    },
    20: {
        nivel_id: 20,
        tipo_reto: 'DESAFÍO FINAL',
        pregunta: '¿Cuánto es 144 ÷ 12 + 25 × 2? (Recuerda: multiplicación y división primero)',
        opciones: { a: '62', b: '67', c: '72', d: '58' },
        respuesta_correcta: 'a',
        explicacion: '¡FELICIDADES! Primero 144÷12=12 y 25×2=50, luego 12+50=62. ¡Has conquistado el Templo de Circuitos!',
        truco: 'Primero: 144÷12=12 y 25×2=50. Luego: 12+50=62. ¡Multiplicación y división siempre primero!',
        puntos_recompensa: 200
    }
}

// ==========================================
// FUNCIÓN AUXILIAR PARA OBTENER FALLBACK
// ==========================================

export function obtenerRetoFallback(nivel) {
    // Primero verificar si existe en las constantes
    if (nivel >= 11 && nivel <= 15 && RETOS_MUNDO_2[nivel]) {
        return { success: true, data: RETOS_MUNDO_2[nivel], fromFallback: true }
    }
    
    if (nivel >= 16 && nivel <= 20 && RETOS_MUNDO_3[nivel]) {
        return { success: true, data: RETOS_MUNDO_3[nivel], fromFallback: true }
    }
    
    // Fallback genérico para niveles sin definir
    return {
        success: true,
        data: {
            nivel_id: nivel,
            tipo_reto: 'Desafío',
            pregunta: `¿Cuál es el resultado de resolver este reto del nivel ${nivel}?`,
            opciones: { a: '10', b: '20', c: '30', d: '40' },
            respuesta_correcta: 'a',
            explicacion: '¡Muy bien! Has completado el nivel.',
            puntos_recompensa: 100
        },
        fromFallback: true
    }
}

// ==========================================
// GENERADOR DE RETOS DINÁMICOS (OPCIONAL)
// Para cuando la DB no tiene datos pero quieres variedad
// ==========================================

export function generarRetoAleatorio(nivel, mundoId) {
    const templates = {
        mundo2: [
            {
                tipo: 'MULTIPLICACIÓN',
                template: 'Si cada {item} vale {val1} y tienes {val2} {items}, ¿cuál es el total?',
                calc: (a, b) => a * b
            },
            {
                tipo: 'DIVISIÓN',
                template: 'Tienes {total} {items} y los repartes entre {val1} amigos. ¿Cuántos {items} por amigo?',
                calc: (a, b) => Math.floor(a / b)
            }
        ],
        mundo3: [
            {
                tipo: 'CÁLCULO',
                template: 'Calcula: {val1} + {val2} × {val3}',
                calc: (a, b, c) => a + (b * c)
            },
            {
                tipo: 'SECUENCIA',
                template: '¿Qué número sigue?: {seq}',
                calc: () => 'observar_patrón'
            }
        ]
    }
    
    // Esta función puede generar retos dinámicos si se necesita más variedad
    // Por ahora usamos los predefinidos
    return null
}

export default { RETOS_MUNDO_2, RETOS_MUNDO_3, obtenerRetoFallback }
