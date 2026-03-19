# 🌟 EL MUNDO DE MÍA - Fase 1 Final Deployment 🎮

## 💠 Visión del Proyecto (Jefe Jhonny)
**El Mundo de Mía** no es solo un juego; es un ecosistema educativo de **alta gama** diseñado para transformar el aprendizaje de las matemáticas en una experiencia sensorial y tecnológica de primer nivel para niños de 3er y 4to grado.

Bajo la dirección del **Jefe Jhonny**, hemos construido un entorno donde la estética **Glass-Neo** y la interactividad **High-End** se unen para motivar a los pequeños guardianes del conocimiento.

---

## 🚀 Estructura del Ecosistema de Despliegue

### 🏢 Organización de Archivos (Fase 1)
```bash
/assets/mia/      # Avatar Granjera (Neo-High), Mia de Oro (Coleccionable)
/assets/bg/       # Fondo de Granja Glass-Neo, Ciudad Cristal
/assets/icons/    # Iconos Cristal Tallado: Girasol, Cizalla, Trigo, Molino
/src/logic/       # game_engine.js, audio_engine.js, engagement.js (Pollito de Cristal)
/src/data/        # retos_3er_grado.sql, bonos_sabiduria.json
/index.html       # Arquitectura de 4 Capas Parallax 
/style.css        # Sistema Neo-Glass & Animaciones de Cosecha (GSAP)
```

---

## 💎 Funcionalidades Clave de Élite

### 🔒 Gating de Grados: Candado de Cristal
El acceso al **Grado 4: Mundo de Mía** está protegido por un **Candado de Cristal**. Solo los guardianes que completen el **Nivel 20 de la Granja (Grado 3)** podrán abrir el portal hacia la ciudad cibernética.

### 📚 Sistema de Bonos: Biblioteca de Cristal
Cada gran logro desbloquea una **Tabla de Sabiduría**. El sistema de apertura de la biblioteca utiliza transiciones de vidrio translúcido para recompensar el progreso cognitivo.

### 🌾 Feedback Visual Premium: Animaciones de Cosecha
Gracias al motor **GSAP**, los aciertos generan animaciones dinámicas de cosecha (zanahorias emergiendo, girasoles duplicándose, hojas de maleza cayendo), vinculando el éxito matemático con la prosperidad del mundo.

### 🐣 Engagement: Pollito de Cristal & Modo Super-Cian
Hemos integrado al **Pollito de Cristal**, una mascota que sigue a Mía y reacciona a los pulsos de energía. Al alcanzar rachas altas, se activa el **Modo Super-Cian**, aumentando el brillo y la escala visual del juego.

---

## 🔧 Configuración Técnica (Supabase Integration)

Para conectar el sistema central con la base de datos de Supabase, sigue estos pasos:

1.  Copia el archivo `.env.example` a `.env`.
2.  Agrega tus credenciales del Panel de Control de Supabase:
    ```env
    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
    VITE_SUPABASE_ANON_KEY=tu-llave-anonima
    ```
3.  Ejecuta los scripts SQL de `/src/data/retos_3er_grado.sql` en el Editor de Consultas de Supabase para inicializar la base de retos.

---

## 🛰️ Preparación para Upload y Git Push

- **Rutas Optimizadas**: Todas las rutas de importación en `index.html` y `main.js` han sido configuradas como **relativas** para asegurar la portabilidad total en GitHub Pages.
- **Seguridad**: El archivo `.gitignore` protege automáticamente las variables de entorno de producción.
- **Preparado para Push**: La carpeta `Deploy_mundo_mia` está lista para ser subida al repositorio mediante el comando `git push origin main`.

---
**Desarrollado por el Equipo Antigravity x Jefe Jhonny**
*Marzo 2026 - Conquistando el futuro de la educación.*
