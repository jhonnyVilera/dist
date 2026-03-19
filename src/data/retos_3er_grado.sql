-- EL MUNDO DE MÍA - FASE 1
-- RETOS 3ER GRADO: LA GRANJA
-- Schema para la tabla retos_niveles

CREATE TABLE IF NOT EXISTS retos_niveles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nivel_id INTEGER NOT NULL,
    grado_id INTEGER NOT NULL,
    tipo_reto VARCHAR(50) NOT NULL, -- 'SUMA', 'RESTA', 'MULTIPLICACION', 'DIVISION'
    pregunta TEXT NOT NULL,
    opciones JSONB NOT NULL, -- Array de opciones [A, B, C, D]
    respuesta_correcta VARCHAR(100) NOT NULL,
    teoria_texto TEXT,
    explicacion TEXT NOT NULL,
    puntos_premio INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ejemplos de retos para la granja (Grado 3)
INSERT INTO retos_niveles (nivel_id, grado_id, tipo_reto, pregunta, opciones, respuesta_correcta, teoria_texto, explicacion)
VALUES
(1, 3, 'SUMA', 
'¡Hola! Necesitamos recolectar 523 zanahorias. ¿Cómo se descompone este número?', 
'["5C + 2D + 3U", "5D + 2U + 3C", "52D + 3U", "3C + 2D + 5C"]', 
'5C + 2D + 3U', 
'Recuerda: C = Centenas (100), D = Decenas (10), U = Unidades (1).', 
'¡Cinco centenas, dos decenas y tres unidades!'),

(2, 3, 'SUMA', 
'En el granero hay 7.402 sacos de trigo. ¿Cuál es el valor del dígito 7?', 
'["70", "700", "7.000", "7"]', 
'7.000', 
'El dígito 7 está en la posición de las Unidades de Mil (UM).', 
'¡Correcto! Siete Unidades de Mil equivalen a siete mil.'),

(6, 3, 'RESTA', 
'Teníamos 4.500 semillas y usamos 1.000 para la maleza. ¿Cuántas quedan?', 
'["3.500", "3.000", "4.000", "2.500"]', 
'3.500', 
'Resta los millares: 4 - 1 = 3 millares.', 
'¡Exacto! Quedan tres mil quinientas semillas.'),

(11, 3, 'MULTIPLICACION', 
'Si plantamos 12 filas de girasoles y cada fila tiene 3, ¿cuántos hay en total?', 
'["30", "36", "32", "24"]', 
'36', 
'Multiplicar es sumar varias veces el mismo número: 12 + 12 + 12.', 
'¡Muy bien! Doce por tres son treinta y seis.'),

(16, 3, 'DIVISION', 
'Queremos repartir 60 costales de papas entre 2 camiones. ¿Cuántos para cada uno?', 
'["30", "20", "40", "15"]', 
'30', 
'Dividir entre 2 es como encontrar la mitad de un número.', 
'¡Perfecto! La mitad de sesenta es treinta.');
