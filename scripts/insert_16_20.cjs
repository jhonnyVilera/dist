require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const retos = [
    { nivel_id: 16, mundo_id: 2, tipo_reto: 'Lógica Avanzada', pregunta: 'El Patrón de los Prismas: 2, 4, 8, 16... ¿Cuál sigue?', opciones: { A: '32', B: '24' }, respuesta_correcta: 'A', truco: '¡Truco! Aquí no sumamos, ¡duplicamos! Identificar si el cambio es suma o multiplicación es la llave.', explicacion: '¡Excelente! Has descubierto que el patrón consiste en duplicar la energía en cada paso. ¡Brillante!', puntos_recompensa: 100 },
    { nivel_id: 17, mundo_id: 2, tipo_reto: 'Estimación', pregunta: 'El Peso del Cristal: Si un cristal pesa 19kg, ¿cuánto pesan 5 aprox?', opciones: { A: '100 kg', B: '80 kg' }, respuesta_correcta: 'A', truco: '¡No calcules exacto! Redondea 19 a 20. 20 x 5 = 100. ¡Ahorra energía mental!', explicacion: '¡Exacto! Usando la estimación y redondeando a 20 puedes calcularlo súper rápido en tu mente.', puntos_recompensa: 100 },
    { nivel_id: 18, mundo_id: 2, tipo_reto: 'Simetría Espacial', pregunta: 'Simetría Espejo: Si doblas un cristal cuadrado por la mitad, ¿qué forma obtienes?', opciones: { A: 'Rectángulo', B: 'Círculo' }, respuesta_correcta: 'A', truco: '¡Cierra los ojos e imaginalo! Tu cerebro puede ver dibujos sin usar los ojos.', explicacion: '¡Correcto! Al doblarlo formando rectángulos conservas los cuatro lados pero cambias su proporción.', puntos_recompensa: 100 },
    { nivel_id: 19, mundo_id: 2, tipo_reto: 'Algoritmo', pregunta: 'Algoritmo de Reparación: Para encender la luz: 1. Conecta, 2. Gira, 3. Pulsa. ¿Qué pasa si haces el 3 primero?', opciones: { A: 'No funciona', B: 'Funciona igual o más brillante' }, respuesta_correcta: 'A', truco: '¡El orden importa! Un algoritmo es como una receta: si pones la sal al final, sabe diferente.', explicacion: '¡Muy bien! En programación y algoritmos, el orden lógico de los pasos lo es todo.', puntos_recompensa: 100 },
    { nivel_id: 20, mundo_id: 2, tipo_reto: 'Lógica', pregunta: 'El Gran Arquitecto: Si el paso A suma 5 y el paso B resta 2, ¿cómo consigues 8 empezando en 0?', opciones: { A: 'A, A, B', B: 'A, B, A' }, respuesta_correcta: 'A', truco: '¡Eres un maestro! Usa todo lo que aprendiste: respira, visualiza y descompón el problema.', explicacion: '¡Increíble! Has dominado la Ciudad Cristal. ¡El portal hacia la Estación Orbital está listo!', puntos_recompensa: 200 }
];

async function insertRetos() {
    for (const reto of retos) {
        // delete first
        await supabase.from('retos_niveles').delete().eq('nivel_id', reto.nivel_id);
        const { data, error } = await supabase.from('retos_niveles').insert(reto);
        if (error) console.error('Error insertando nivel', reto.nivel_id, error);
        else console.log('Nivel', reto.nivel_id, 'insertado/actualizado correctamente.');
    }
}
insertRetos();
