-- =====================================================
-- EL MUNDO DE MÍA - RETOS MUNDO 3 (Niveles 16-20)
-- Templo de Circuitos
-- =====================================================
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Insertar niveles_config para Mundo 3 (si no existen)
INSERT INTO niveles_config (numero_nivel, nombre, activo)
SELECT 16, 'Nivel 16: Circuitos Básicos', true
WHERE NOT EXISTS (SELECT 1 FROM niveles_config WHERE numero_nivel = 16);

INSERT INTO niveles_config (numero_nivel, nombre, activo)
SELECT 17, 'Nivel 17: Lógica Digital', true
WHERE NOT EXISTS (SELECT 1 FROM niveles_config WHERE numero_nivel = 17);

INSERT INTO niveles_config (numero_nivel, nombre, activo)
SELECT 18, 'Nivel 18: Patrones Binarios', true
WHERE NOT EXISTS (SELECT 1 FROM niveles_config WHERE numero_nivel = 18);

INSERT INTO niveles_config (numero_nivel, nombre, activo)
SELECT 19, 'Nivel 19: Algoritmos', true
WHERE NOT EXISTS (SELECT 1 FROM niveles_config WHERE numero_nivel = 19);

INSERT INTO niveles_config (numero_nivel, nombre, activo)
SELECT 20, 'Nivel 20: Templo Final', true
WHERE NOT EXISTS (SELECT 1 FROM niveles_config WHERE numero_nivel = 20);

-- 2. Insertar retos_niveles para Mundo 3
-- Nivel 16: Circuitos Básicos
INSERT INTO retos_niveles (nivel_id, tipo_reto, pregunta, opciones, respuesta_correcta, explicacion, puntos_recompensa)
VALUES (
    16,
    'Circuito',
    '¿Cuál es el resultado de 8 × 7 en el circuito del Templo?',
    '{"a": "54", "b": "56", "c": "58", "d": "52"}',
    'b',
    '¡Correcto! 8 × 7 = 56. Has activado el primer circuito del Templo. ¡Sigue adelante, guardsián!',
    150
);

-- Nivel 17: Lógica Digital
INSERT INTO retos_niveles (nivel_id, tipo_reto, pregunta, opciones, respuesta_correcta, explicacion, puntos_recompensa)
VALUES (
    17,
    'Lógica',
    'Si un robot tiene 45 chips y le das el doble a otro robot, ¿cuántos chips regalaste en total?',
    '{"a": "90", "b": "85", "c": "95", "d": "80"}',
    'a',
    '¡Exacto! 45 × 2 = 90 chips. La lógica digital fluye en ti. ¡Eres un maestro de los circuitos!',
    175
);

-- Nivel 18: Patrones Binarios
INSERT INTO retos_niveles (nivel_id, tipo_reto, pregunta, opciones, respuesta_correcta, explicacion, puntos_recompensa)
VALUES (
    18,
    'Binario',
    '¿Qué número representa 100 en el sistema binario del Templo?',
    '{"a": "4", "b": "8", "c": "2", "d": "16"}',
    'a',
    '¡Perfecto! 100 en binario = 4 en decimal. Has descifrado el código secreto del Templo. ¡Increíble!',
    200
);

-- Nivel 19: Algoritmos
INSERT INTO retos_niveles (nivel_id, tipo_reto, pregunta, opciones, respuesta_correcta, explicacion, puntos_recompensa)
VALUES (
    19,
    'Algoritmo',
    'Un algoritmo procesa: 100 + 25 × 2. ¿Cuál es el resultado final?',
    '{"a": "250", "b": "150", "c": "200", "d": "175"}',
    'b',
    '¡Muy bien! Primero multiplicamos: 25 × 2 = 50. Luego sumamos: 100 + 50 = 150. ¡El algoritmo está completo!',
    225
);

-- Nivel 20: Templo Final
INSERT INTO retos_niveles (nivel_id, tipo_reto, pregunta, opciones, respuesta_correcta, explicacion, puntos_recompensa)
VALUES (
    20,
    'Final',
    '¡Felicidades, guardsián del Templo! Has completado todos los circuitos. ¿Cuánto es 999 + 1?',
    '{"a": "1000", "b": "1001", "c": "999", "d": "1100"}',
    'a',
    '¡MISION CUMPLIDA! Has completado EL MUNDO DE MÍA. Eres un auténtico guardsián de los circuitos. ¡Tu corona dorada te espera!',
    500
);

-- 3. Verificar inserción
SELECT * FROM retos_niveles WHERE nivel_id >= 16 ORDER BY nivel_id;
SELECT * FROM niveles_config WHERE numero_nivel >= 16 ORDER BY numero_nivel;
