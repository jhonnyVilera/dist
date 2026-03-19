import './style.css'
import { supabase, obtenerPerfil, obtenerTodosPerfiles, seleccionarPerfil, obtenerNivelesConfig, obtenerRetoNivel, actualizarProgreso, crearPerfil, refrescarPerfil, reiniciarProgreso, setCachedProfile } from './src/supabase.js'
import { getAudioUrlWithFallback } from './src/storage.js'
import { gsap } from 'gsap'
import { audioEngine } from './src/logic/audio_engine.js'
import { gameEngine } from './src/logic/game_engine.js'
import { engagementSystem } from './src/logic/engagement.js'

// ==========================================
// FEEDBACK HÁPTICO - MÓVIL
// ==========================================
function triggerHaptic(type = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [30, 30, 30]
        }
        navigator.vibrate(patterns[type] || patterns.light)
    }
}

// ==========================================
// ANIMACIONES DE COSECHA - FEEDBACK VISUAL
// ==========================================

function createHarvestContainer() {
    let container = document.getElementById('harvest-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'harvest-container'
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `
        document.body.appendChild(container)
    }
    container.innerHTML = ''
    return container
}

function playHarvestAnimation(tipoOperacion) {
    const container = createHarvestContainer()
    
    const animations = {
        SUMA: createVegetablesAnimation,
        RESTA: createLeavesAnimation,
        MULTIPLICACION: createBalesAnimation,
        DIVISION: createBagsAnimation
    }
    
    const animFn = animations[tipoOperacion] || animations.SUMA
    animFn(container)
}

function createVegetablesAnimation(container) {
    const vegetables = ['🥕', '🥬', '🌽', '🍅', '🥦', '🌶️', '🍆', '🥔']
    
    for (let i = 0; i < 8; i++) {
        const veg = document.createElement('div')
        veg.textContent = vegetables[Math.floor(Math.random() * vegetables.length)]
        veg.style.cssText = `
            position: absolute;
            font-size: ${2 + Math.random() * 2}rem;
            left: ${10 + Math.random() * 80}%;
            bottom: 0;
            animation: harvest-vegetables ${0.8 + Math.random() * 0.4}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            animation-delay: ${i * 0.1}s;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
        `
        container.appendChild(veg)
    }
    
    setTimeout(() => container.remove(), 2000)
}

function createLeavesAnimation(container) {
    const leaves = ['🍂', '🍃', '🍁', '🌿', '🌱']
    
    for (let i = 0; i < 12; i++) {
        const leaf = document.createElement('div')
        leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)]
        leaf.style.cssText = `
            position: absolute;
            font-size: ${1.5 + Math.random() * 1.5}rem;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 30}%;
            animation: harvest-leaves ${1.5 + Math.random()}s ease-in forwards;
            animation-delay: ${i * 0.1}s;
            filter: drop-shadow(0 0 10px rgba(50, 205, 50, 0.7));
        `
        container.appendChild(leaf)
    }
    
    setTimeout(() => container.remove(), 3000)
}

function createBalesAnimation(container) {
    const bales = ['🌾', '🪵', '🌻', '🌾', '🪵', '🌻']
    
    for (let i = 0; i < 6; i++) {
        const bale = document.createElement('div')
        bale.textContent = bales[i]
        bale.style.cssText = `
            position: absolute;
            font-size: ${2.5 + Math.random()}rem;
            left: ${15 + i * 12}%;
            bottom: 10%;
            animation: harvest-bales 1s ease-in-out forwards;
            animation-delay: ${i * 0.15}s;
            filter: drop-shadow(0 0 20px rgba(255, 191, 0, 0.9));
        `
        container.appendChild(bale)
    }
    
    setTimeout(() => container.remove(), 2500)
}

function createBagsAnimation(container) {
    const bags = ['💰', '🎁', '📦', '💰', '🎁', '📦']
    
    for (let i = 0; i < 6; i++) {
        const bag = document.createElement('div')
        bag.textContent = bags[i]
        bag.style.cssText = `
            position: absolute;
            font-size: ${2 + Math.random()}rem;
            left: ${15 + i * 12}%;
            bottom: 15%;
            animation: harvest-bags 1.2s ease-in-out forwards;
            animation-delay: ${i * 0.2}s;
            filter: drop-shadow(0 0 15px rgba(139, 0, 0, 0.8));
        `
        container.appendChild(bag)
    }
    
    setTimeout(() => container.remove(), 3000)
}

// ==========================================
// INDICADOR DE RACHA
// ==========================================
function actualizarIndicadorRacha() {
    const streakIndicator = document.getElementById('streak-indicator')
    const streakCount = document.getElementById('streak-count')
    const streakFire = document.getElementById('streak-fire')
    
    if (!streakIndicator || !streakCount) return
    
    const racha = appState.rachaCorrectas || 0
    
    if (racha > 0) {
        streakIndicator.classList.add('visible')
        streakCount.textContent = racha
        
        if (racha >= 2) {
            streakIndicator.classList.add('hot')
            streakFire.textContent = '🔥🔥'
        } else {
            streakIndicator.classList.remove('hot')
            streakFire.textContent = '🔥'
        }
        
        // Animación de entrada
        gsap.fromTo(streakIndicator, 
            { scale: 0.8, opacity: 0.5 }, 
            { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        )
    } else {
        streakIndicator.classList.remove('visible', 'hot')
        streakFire.textContent = '🔥'
    }
}

// Función para agregar feedback táctil a elementos
function addTouchFeedback(element, options = {}) {
    const {
        haptic = 'light',
        scale = 0.95,
        duration = 150
    } = options

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        element.addEventListener('touchstart', () => {
            triggerHaptic(haptic)
            gsap.to(element, { scale: scale, duration: duration / 1000, ease: 'power2.out' })
        }, { passive: true })

        element.addEventListener('touchend', () => {
            gsap.to(element, { scale: 1, duration: duration / 1000, ease: 'power2.out' })
        }, { passive: true })
    }
}

// ==========================================
// CONFETTI ANIMATION
// ==========================================
function createConfetti(options = {}) {
    const {
        count = 50,
        duration = 3000,
        colors = ['#00D4FF', '#FF00FF', '#FFD700', '#00FF88', '#8A2BE2']
    } = options

    const container = document.getElementById('confetti-container')
    if (!container) return

    container.innerHTML = ''

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div')
        confetti.className = 'confetti'
        
        const shapes = ['square', 'circle', 'star']
        confetti.classList.add(shapes[Math.floor(Math.random() * shapes.length)])
        
        confetti.style.left = Math.random() * 100 + 'vw'
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'
        confetti.style.animationDelay = Math.random() * 0.5 + 's'
        confetti.style.width = (Math.random() * 10 + 5) + 'px'
        confetti.style.height = confetti.style.width
        
        container.appendChild(confetti)
    }

    setTimeout(() => {
        container.innerHTML = ''
    }, duration + 1000)
}

// Global App State
const appState = {
    nivelActual: 1,
    puntosTotales: 0,
    nombre: "MÍA",
    mundoActual: 1, // 1: Bosque Neón, 2: Ciudad Cristal, 3: Templo Circuitos
    nivelesConfig: [],
    rachaCorrectas: 0, // Contador de respuestas correctas seguidas
    gradoActual: 3, // 3: La Granja, 4: El Mundo de Mía
    tablaDesbloqueada: null // Tabla coleccionada de la Biblioteca de Cristal
}

// Configuración de Mundos por Grado
const MUNDOS_CONFIG = {
    3: [ // GRADO 3: LA GRANJA
        { id: 1, nombre: 'COSECHA DE NÚMEROS', icono: '🌾', color: '#32CD32', niveles: [1, 2, 3, 4, 5], operacion: 'SUMA' },
        { id: 6, nombre: 'LIMPIEZA DE MALEZA', icono: '🌿', color: '#8B4513', niveles: [6, 7, 8, 9, 10], operacion: 'RESTA' },
        { id: 11, nombre: 'DUPLICADOR DE SEMILLAS', icono: '🌻', color: '#FFBF00', niveles: [11, 12, 13, 14, 15], operacion: 'MULTIPLICACION' },
        { id: 16, nombre: 'REPARTO DEL GRANERO', icono: '🏠', color: '#8B0000', niveles: [16, 17, 18, 19, 20], operacion: 'DIVISION' }
    ],
    4: [ // GRADO 4: EL MUNDO DE MÍA
        { id: 1, nombre: 'BOSQUE NEÓN', icono: '🌿', color: '#00D4FF', niveles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], operacion: 'MATEMATICAS' },
        { id: 11, nombre: 'CIUDAD CRISTAL', icono: '💎', color: '#8A2BE2', niveles: [11, 12, 13, 14, 15], operacion: 'MATEMATICAS' },
        { id: 16, nombre: 'TEMPLO CIRCUITOS', icono: '⚡', color: '#FF00FF', niveles: [16, 17, 18, 19, 20], operacion: 'MATEMATICAS' }
    ]
}

// Bibliotecas coleccionables
const TABLAS_BIBLIOTECA = {
    3: { // Grado 3
        SUMA: { nombre: 'Tabla de Sumar', icono: '➕', nivelRequerido: 3 },
        RESTA: { nombre: 'Tabla de Restar', icono: '➖', nivelRequerido: 8 },
        MULTIPLICACION: { nombre: 'Tabla del 1-10', icono: '✖️', nivelRequerido: 13 },
        DIVISION: { nombre: 'Tabla de Dividir', icono: '➗', nivelRequerido: 18 }
    }
}

// Cache de URLs de audio
const audioUrlCache = {}

window.audioIsMuted = false
window.isMiaTalking = false
let currentVoiceAudio = null

// Función para obtener URL de audio desde Storage
async function getAudioUrlLocal(filename) {
    if (audioUrlCache[filename]) {
        return audioUrlCache[filename]
    }
    
    const url = await getAudioUrlWithFallback(filename)
    if (url) {
        audioUrlCache[filename] = url
    }
    return url
}

// Función para precargar todos los audios
async function preloadAllAudios() {
    const audioFiles = [
        'mia_bienvenida.mp3', 'mia_acierto.mp3', 'mia_error.mp3', 'mia_lupa.mp3',
        'mia_nivel_1.mp3', 'mia_nivel_2.mp3', 'mia_nivel_3.mp3', 'mia_nivel_4.mp3', 'mia_nivel_5.mp3',
        'mia_nivel_6.mp3', 'mia_nivel_7.mp3', 'mia_nivel_8.mp3', 'mia_nivel_9.mp3', 'mia_nivel_10.mp3',
        'mia_nivel_11.mp3', 'mia_nivel_12.mp3', 'mia_nivel_13.mp3', 'mia_nivel_14.mp3', 'mia_nivel_15.mp3',
        'mia_nivel_16.mp3', 'mia_nivel_17.mp3', 'mia_nivel_18.mp3', 'mia_nivel_19.mp3', 'mia_nivel_20.mp3',
        'mia_mundo_1_completado.mp3', 'mia_mundo_2_bienvenida.mp3', 'mia_mundo_2_completado.mp3',
        'mia_mundo_3_bienvenida.mp3', 'mia_mundo_3_completado.mp3',
        'The_Jungle.mp3', 'ciudadCristal.mp3', 'afro_house_menu.mp3'
    ]
    
    console.log('[Audio] Pre-cargando URLs de audio...')
    await Promise.all(audioFiles.map(f => getAudioUrl(f)))
    console.log('[Audio] URLs de audio pre-cargadas')
}

// Objeto VOCES con rutas dinámicas (se resuelven en runtime)
const VOCES_MIA = {
    'bienvenida': {
        get url() { return audioUrlCache['mia_bienvenida.mp3'] || '/assets/audio/mia_bienvenida.mp3' },
        texto: '¡Hola! Soy Mía. ¡Qué alegría que estés aquí en el Bosque Neón! ¿Lista para nuestra primera misión matemática? ¡Vamos a brillar!'
    },
    'acierto': {
        get url() { return audioUrlCache['mia_acierto.mp3'] || '/assets/audio/mia_acierto.mp3' },
        texto: '¡Increíble! ¡Lo lograste! Sabía que eras muy inteligente. ¡Sigamos adelante!'
    },
    'error': {
        get url() { return audioUrlCache['mia_error.mp3'] || '/assets/audio/mia_error.mp3' },
        texto: '¡Oh! Estuviste muy cerca. No te preocupes, los grandes exploradores aprenden intentándolo de nuevo. ¡Tú puedes!'
    },
    'nivel_1': {
        url: '/assets/audio/mia_nivel_1.mp3',
        texto: '¡Excelente! Has descompuesto el número perfectamente: cinco centenas, tres decenas y dos unidades. ¡Eres genial!'
    },
    'nivel_2': {
        url: '/assets/audio/mia_nivel_2.mp3',
        texto: '¡Muy bien! El siete está en la posición de las Unidades de Mil, por eso su valor es de siete mil. ¡Sigamos!'
    },
    'nivel_3': {
        url: '/assets/audio/mia_nivel_3.mp3',
        texto: '¡Exacto! Como cincuenta y ocho es mayor que cincuenta, subimos a la centena más cercana que es quinientos. ¡Punto para ti!'
    },
    'nivel_4': {
        url: '/assets/audio/mia_nivel_4.mp3',
        texto: '¡Buen ojo! Doce mil cinco es menor porque tiene cero decenas, mientras que el otro tenía cincuenta. ¡Avanzamos!'
    },
    'nivel_5': {
        url: '/assets/audio/mia_nivel_5.mp3',
        texto: '¡Genial! Te diste cuenta de que la serie aumentaba de cincuenta en cincuenta. ¡Mil cuatrocientos es la respuesta!'
    },
    'nivel_6': {
        url: '/assets/audio/mia_nivel_6.mp3',
        texto: '¡Perfecto! El secreto es poner el cero en las decenas para que el número diga exactamente quince mil trescientos dos.'
    },
    'nivel_7': {
        url: '/assets/audio/mia_nivel_7.mp3',
        texto: '¡Eso es! A cinco mil le quitamos mil y luego los quinientos... ¡nos quedan tres mil quinientos! ¡Qué rápido eres!'
    },
    'nivel_8': {
        url: '/assets/audio/mia_nivel_8.mp3',
        texto: '¡Increíble! Ocho por siete son cincuenta y seis. Te sabes las tablas de maravilla, ¡estoy muy orgullosa!'
    },
    'nivel_9': {
        url: '/assets/audio/mia_nivel_9.mp3',
        texto: '¡Correcto! El ocho ocupa las Unidades de Mil, así que representa ocho mil unidades en ese número.'
    },
    'nivel_10': {
        url: '/assets/audio/mia_nivel_10.mp3',
        texto: '¡Eres un crack! El doble de mil doscientos cincuenta es dos mil quinientos. ¡Has completado el primer mundo!'
    },
    'nivel_11': {
        url: '/assets/audio/mia_nivel_11.mp3',
        texto: '¡Excelente! Multiplicaste muy rápido. Doce por tres son treinta y seis cartas entregadas. ¡La ciudad te necesita!'
    },
    'nivel_12': {
        url: '/assets/audio/mia_nivel_12.mp3',
        texto: '¡Muy bien! Cien menos la mitad son cincuenta, más veinte... ¡setenta cristales! El sistema brilla con tu ayuda.'
    },
    'nivel_13': {
        url: '/assets/audio/mia_nivel_13.mp3',
        texto: '¡Buen ojo con los decimales! Uno punto dos es el mayor. Estás descifrando los códigos de cristal perfectamente.'
    },
    'nivel_14': {
        url: '/assets/audio/mia_nivel_14.mp3',
        texto: '¡Exacto! El cambio es de treinta y cinco monedas. ¡Tu mente es más rápida que cualquier procesador!'
    },
    'nivel_15': {
        url: '/assets/audio/mia_nivel_15.mp3',
        texto: '¡Eso es! Un hexágono tiene seis lados. ¡Estás aprendiendo las formas de la tecnología!'
    },
    'nivel_16': {
        url: '/assets/audio/mia_nivel_16.mp3',
        texto: '¡Llegaste al piso trece! Sumar y restar pisos es pan comido para ti. ¡Sigamos subiendo!'
    },
    'nivel_17': {
        url: '/assets/audio/mia_nivel_17.mp3',
        texto: '¡Genial! El cero punto ocho completa la serie. Entiendes los patrones digitales de maravilla.'
    },
    'nivel_18': {
        url: '/assets/audio/mia_nivel_18.mp3',
        texto: '¡Perfecto! Un kilómetro y medio son mil quinientos metros. Menos los quinientos... ¡quedan mil! ¡Eres un gran estratega!'
    },
    'nivel_19': {
        url: '/assets/audio/mia_nivel_19.mp3',
        texto: '¡Increíble! La mitad es setecientos cincuenta. Has equilibrado la energía del núcleo con éxito.'
    },
    'nivel_20': {
        url: '/assets/audio/mia_nivel_20.mp3',
        texto: '¡LO LOGRASTE! Sesenta datos procesados en tiempo récord. ¡ERES LA MAESTRA SUPREMA DE LA CIUDAD CRISTAL!'
    },
    'mundo_1_completado': {
        url: '/assets/audio/mia_mundo_1_completado.mp3',
        texto: '¡Lo logramos, Jefe Jhonny! Hemos conquistado el Bosque Neón. ¡Eres un maestro de las matemáticas!'
    },
    'mundo_2_bienvenida': {
        url: '/assets/audio/mia_mundo_2_bienvenida.mp3',
        texto: '¡Bienvenida a la Ciudad de los Algoritmos de Cristal! Aquí la tecnología y la lógica se unen. ¿Lista para brillar con el oro neón? ¡Vamos!'
    },
    'lupa': {
        url: '/assets/audio/mia_lupa.mp3',
        texto: '¡Psst! Antes de empezar, tengo un truquito para ti. ¡Presta mucha atención!'
    },
    'mundo_2_completado': {
        url: '/assets/audio/mia_mundo_2_completado.mp3',
        texto: '¡INCREÍBLE! Has desbloqueado todos los cristales de la ciudad. ¡Eres una genia de la lógica, Jefa Isabela!'
    },
    'mundo_3_bienvenida': {
        url: '/assets/audio/mia_mundo_3_bienvenida.mp3',
        texto: '¡BIENVENIDA AL TEMPLO DE CIRCUITOS! Aquí los números se transforman en energía pura. ¿Lista para convertirte en guardsiana del núcleo? ¡Vamos a activar los circuitos!'
    },
    'mundo_3_completado': {
        url: '/assets/audio/mia_mundo_3_completado.mp3',
        texto: '¡MISION ABSOLUTAMENTE CUMPLIDA! Has activado todos los circuitos del templo. ¡Eres la GUARDIANA SUPREMA DEL NÚCLEO! Tu corona dorada brilla con luz propia. ¡Felicidades, campeão!'
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const splash = document.getElementById('splash-screen')
    const app = document.getElementById('app')
    const loaderBar = document.getElementById('loader-bar')
    const splashStatus = document.getElementById('splash-status')
    const globalMia = document.getElementById('global-mia-sidebar')
    let transitionDone = false // Flag para evitar doble transición
    
    // OCULTAR SIDEBAR DE MÍA AL INICIO
    if (globalMia) {
        globalMia.style.display = 'none'
    }

    gsap.to(loaderBar, { width: "30%", duration: 0.8, ease: "power2.out" })

    // Función para transición a la app
    function transitionToApp() {
        if (transitionDone) return
        transitionDone = true
        console.log("Iniciando transición a la app...")
        const splashEl = document.getElementById('splash-screen')
        const appEl = document.getElementById('app')
        const loaderEl = document.getElementById('loader-bar')
        
        if (loaderEl) gsap.to(loaderEl, { width: "100%", duration: 0.5 })
        
        setTimeout(() => {
            if (!splashEl || !appEl) {
                console.error("Elementos no encontrados")
                return
            }
            
            // Ocultar modal de usuario si existe
            const userModal = document.getElementById('user-select-modal')
            if (userModal) userModal.style.display = 'none'
            
            gsap.to(splashEl, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => {
                    splashEl.style.display = 'none'
                    appEl.style.display = 'flex'
                    
                    const globalMia = document.getElementById('global-mia-sidebar')
                    if (globalMia) globalMia.style.display = 'flex'

                    console.log("App displayed. Initializing...")
                    initAppAnimations()
                    initInteractions()
                    updateHUD()

                    if (!window.bgmAudio) {
                        appState.mundoActual = 0;
                        playWorldBGM();
                    }
                }
            })
        }, 500)
    }

    let profileLoaded = false

    try {
        splashStatus.innerText = "Cargando perfiles..."
        
        // Obtener todos los perfiles
        const perfilesRes = await obtenerTodosPerfiles()
        console.log("Perfiles obtenidos:", perfilesRes)
        
        if (perfilesRes.success && perfilesRes.data && perfilesRes.data.length > 0) {
            const perfiles = perfilesRes.data
            console.log("Cantidad de perfiles:", perfiles.length)
            
            if (perfiles.length === 1) {
                // Solo un usuario, cargar directamente
                const data = perfiles[0]
                appState.nombre = data.nombre || "MÍA"
                appState.nivelActual = parseInt(data.nivel_actual) || 1
                appState.puntosTotales = data.puntos_totales || "0000"
                setCachedProfile(data)
                
                splashStatus.innerText = `Bienvenido, ${data.nombre}!`
                gsap.to(loaderBar, { width: "70%", duration: 0.5 })
                
                // Ir a la app después de un breve delay
                setTimeout(() => transitionToApp(), 1000)
            } else {
                // Múltiples usuarios, mostrar selector
                mostrarSelectorUsuarios(perfiles, transitionToApp)
            }
        } else {
            // No hay perfiles o error, crear uno nuevo
            splashStatus.innerText = "Creando perfil..."
            const newProfile = await crearPerfil()
            if (newProfile.success && newProfile.data) {
                appState.nombre = newProfile.data.nombre || "MÍA"
                appState.nivelActual = 1
                appState.puntosTotales = "0000"
            }
            gsap.to(loaderBar, { width: "100%", duration: 0.5 })
            setTimeout(() => transitionToApp(), 1000)
        }
        
        // Verificar si debe activar avatar dorado desde el inicio (solo para Grado 4)
        if (appState.nivelActual >= 20 && appState.gradoActual === 4) {
            activateGoldAvatar()
        }
        
        profileLoaded = true

    } catch (err) {
        console.error("Error al cargar perfil:", err)
        splashStatus.innerText = "Modo local de emergencia..."
        gsap.to(loaderBar, { width: "100%", duration: 0.5 })
        profileLoaded = true
    }

    // Transition to App - siempre se ejecuta
    setTimeout(async () => {
        if (transitionDone) return // Ya se hizo la transición
        
        // Primero verificar si hay selector de usuarios activo
        const userModal = document.getElementById('user-select-modal')
        if (userModal && userModal.style.display === 'flex') {
            console.log("Selector de usuarios activo, esperando...")
            return // No continuar hasta que seleccione usuario
        }
        
        if (!splash || !app) {
            console.error("Elementos del DOM no encontrados")
            return
        }
        
        transitionDone = true
        gsap.to(splash, {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                splash.style.display = 'none'
                app.style.display = 'flex'
                
                const globalMia = document.getElementById('global-mia-sidebar')
                if (globalMia) globalMia.style.display = 'flex'

                console.log("App displayed. Initializing...")
                updateHUD()

                if (!window.bgmAudio) {
                    appState.mundoActual = 0;
                    playWorldBGM();
                }
            }
        })
    }, 1500)
    // Inicializar sistemas de la Fase 1
    gameEngine.init(appState)
    engagementSystem.init()
})

function updateHUD() {
    const nameEl = document.getElementById('player-name')
    const levelEl = document.getElementById('player-level')
    const pointsEl = document.getElementById('player-points')

    nameEl.innerText = appState.nombre
    levelEl.innerText = `Nivel ${appState.nivelActual}`
    
    // Asegurar que puntosTotales sea string con 4 dígitos
    const puntos = typeof appState.puntosTotales === 'number' 
        ? appState.puntosTotales.toString() 
        : appState.puntosTotales
    pointsEl.innerText = puntos.padStart(4, '0')
    
    // Debug
    console.log(`[HUD] Nivel: ${appState.nivelActual} | Puntos: ${puntos}`)
    
    renderWorldUnlockUI()
}

function renderWorldUnlockUI() {
    const world2Card = document.getElementById('world-2-card')
    const world2Status = document.getElementById('world-2-status')
    const world3Card = document.getElementById('world-3-card')
    const world3Status = document.getElementById('world-3-status')

    if (appState.nivelActual >= 11) {
        if (world2Card) {
            world2Card.classList.remove('world-locked')
            world2Card.classList.add('neon-glow-cyan')
        }
        if (world2Status) world2Status.innerText = 'CIUDAD DISPONIBLE'
    }

    if (appState.nivelActual >= 16) {
        if (world3Card) {
            world3Card.classList.remove('world-locked')
            world3Card.classList.add('neon-glow-gold')
        }
        if (world3Status) world3Status.innerText = 'TEMPLO DISPONIBLE'
    }
}

// ==========================================
// SISTEMA DE GRADOS - LA GRANJA / MUNDO DE MÍA
// ==========================================

function initGradeSelector() {
    const grade3Btn = document.getElementById('grade-3-btn')
    const grade4Btn = document.getElementById('grade-4-btn')
    
    if (!grade3Btn || !grade4Btn) return
    
    // Verificar si el grado 4 está desbloqueado (nivel 20 completado)
    const nivelActual = appState.nivelActual || 1
    if (nivelActual >= 21) {
        grade4Btn.classList.remove('locked')
        grade4Btn.querySelector('.grade-icon').textContent = '⚡'
        document.getElementById('world-selector').style.display = 'grid'
    }
    
    // Click en grado 3
    grade3Btn.addEventListener('click', () => {
        if (grade3Btn.classList.contains('locked')) return
        cambiarGrado(3)
    })
    
    // Click en grado 4
    grade4Btn.addEventListener('click', () => {
        if (grade4Btn.classList.contains('locked')) {
            showToast('🔒 Completa el Nivel 20 del Grado 3 para desbloquear', 'info')
            return
        }
        cambiarGrado(4)
    })
}

function actualizarEstadoMundos() {
    const nivelActual = appState.nivelActual || 1
    const grado = appState.gradoActual || 3
    
    if (grado === 3) {
        const granja2Card = document.getElementById('granja-2-card')
        if (granja2Card) {
            if (nivelActual >= 6) {
                granja2Card.classList.remove('world-locked')
                granja2Card.style.filter = 'none'
                granja2Card.style.opacity = '1'
                if (document.getElementById('granja-2-status')) {
                    document.getElementById('granja-2-status').innerText = '¡ENTRA A RESTAR!'
                }
            }
        }
        
        const granja3Card = document.getElementById('granja-3-card')
        if (granja3Card) {
            if (nivelActual >= 11) {
                granja3Card.classList.remove('world-locked')
                granja3Card.style.filter = 'none'
                granja3Card.style.opacity = '1'
                if (document.getElementById('granja-3-status')) {
                    document.getElementById('granja-3-status').innerText = '¡ENTRA A MULTIPLICAR!'
                }
            }
        }
        
        const granja4Card = document.getElementById('granja-4-card')
        if (granja4Card) {
            if (nivelActual >= 16) {
                granja4Card.classList.remove('world-locked')
                granja4Card.style.filter = 'none'
                granja4Card.style.opacity = '1'
                if (document.getElementById('granja-4-status')) {
                    document.getElementById('granja-4-status').innerText = '¡ENTRA A DIVIDIR!'
                }
            }
        }
    }
    
    if (grado === 4) {
        const mundo2Card = document.getElementById('world-2-card')
        if (mundo2Card) {
            if (nivelActual >= 11) {
                mundo2Card.classList.remove('world-locked')
                mundo2Card.classList.add('neon-glow-pink')
                mundo2Card.style.filter = 'none'
                mundo2Card.style.opacity = '1'
                if (document.getElementById('world-2-status')) {
                    document.getElementById('world-2-status').innerText = '¡ENTRA AL MUNDO 2!'
                }
            }
        }
        
        const mundo3Card = document.getElementById('world-3-card')
        if (mundo3Card) {
            if (nivelActual >= 16) {
                mundo3Card.classList.remove('world-locked')
                mundo3Card.classList.add('neon-glow-gold')
                mundo3Card.style.filter = 'none'
                mundo3Card.style.opacity = '1'
                if (document.getElementById('world-3-status')) {
                    document.getElementById('world-3-status').innerText = '¡ENTRA AL MUNDO 3!'
                }
            }
        }
    }
}

function cambiarGrado(grado) {
    const grade3Btn = document.getElementById('grade-3-btn')
    const grade4Btn = document.getElementById('grade-4-btn')
    const granjaSelector = document.getElementById('world-selector-granja')
    const mundoSelector = document.getElementById('world-selector')
    const avatar = document.getElementById('mia-star-main')
    const globalMia = document.getElementById('global-mia-sidebar')
    
    appState.gradoActual = grado
    
    if (grado === 3) {
        grade3Btn.classList.add('active')
        grade4Btn.classList.remove('active')
        granjaSelector.style.display = 'grid'
        mundoSelector.style.display = 'none'
        document.body.setAttribute('data-grado', '3')
        if (avatar) {
            avatar.src = './assets/mia/mia_granjera.png'
            avatar.classList.add('mia-granja-avatar')
            avatar.classList.remove('avatar-gold-special', 'avatar-gold-special-glow')
            console.log('[Avatar] Cambiado a farm_mia.png (Grado 3 - La Granja)')
        }
        if (globalMia) globalMia.style.display = 'flex'
    } else {
        grade3Btn.classList.remove('active')
        grade4Btn.classList.add('active')
        granjaSelector.style.display = 'none'
        mundoSelector.style.display = 'grid'
        document.body.setAttribute('data-grado', '4')
        if (avatar) {
            avatar.src = './assets/mia/mia_granjera.png'
            avatar.classList.remove('mia-granja-avatar')
            console.log('[Avatar] Cambiado a Mia_avatar.png (Grado 4 - El Mundo de Mía)')
        }
        if (globalMia) globalMia.style.display = 'flex'
    }
    
    actualizarEstadoMundos()
    triggerHaptic('medium')
    console.log(`[Grado] Cambiado a grado ${grado}`)
}

// ==========================================
// MÍA TEORÍA - TRUCO PEDAGÓGICO
// ==========================================

function mostrarTeoriaMia(retoData) {
    if (!retoData || !retoData.teoria_texto) {
        // Si no hay teoría, ir directo a la práctica
        return false
    }
    
    const overlay = document.getElementById('mia-teoria-overlay')
    const tipoEl = document.getElementById('teoria-tipo')
    const textoEl = document.getElementById('teoria-texto')
    const ejemploEl = document.getElementById('teoria-ejemplo')
    
    if (!overlay) return false
    
    // Llenar datos de la teoría
    if (tipoEl) tipoEl.textContent = retoData.tipo_reto || 'TRUCO'
    if (textoEl) textoEl.textContent = retoData.teoria_texto
    if (ejemploEl) {
        // Extraer ejemplo de la explicación
        ejemploEl.textContent = retoData.explicacion || ''
    }
    
    // Mostrar modal
    overlay.classList.add('active')
    
    // Reproducir voz de Mía explicando
    if (typeof hablarMia === 'function') {
        hablarMia(retoData.teoria_texto, true)
    }
    
    return true
}

function cerrarTeoriaMia(callback) {
    const overlay = document.getElementById('mia-teoria-overlay')
    if (overlay) {
        overlay.classList.remove('active')
    }
    
    if (typeof callback === 'function') {
        callback()
    }
}

function initTeoriaListeners() {
    const btnClose = document.getElementById('btn-close-teoria')
    const btnUnderstood = document.getElementById('btn-teoria-understood')
    
    if (btnClose) {
        btnClose.addEventListener('click', () => cerrarTeoriaMia())
    }
    
    if (btnUnderstood) {
        btnUnderstood.addEventListener('click', () => cerrarTeoriaMia())
    }
}

// ==========================================
// BIBLIOTECA DE CRISTAL - PREMIOS COLECCIONABLES
// ==========================================

function initBiblioteca() {
    const btnOpen = document.getElementById('btn-open-library')
    const btnClose = document.getElementById('btn-close-library')
    const btnOk = document.getElementById('btn-close-library-ok')
    const grid = document.getElementById('library-grid')
    
    if (btnOpen) {
        btnOpen.addEventListener('click', mostrarBiblioteca)
    }
    
    if (btnClose) {
        btnClose.addEventListener('click', cerrarBiblioteca)
    }
    
    if (btnOk) {
        btnOk.addEventListener('click', cerrarBiblioteca)
    }
}

function mostrarBiblioteca() {
    const overlay = document.getElementById('library-overlay')
    const grid = document.getElementById('library-grid')
    const hint = document.getElementById('library-unlock-hint')
    
    if (!overlay || !grid) return
    
    const nivelActual = appState.nivelActual || 1
    const tablas = TABLAS_BIBLIOTECA[3] // Por ahora solo grado 3
    
    let html = ''
    let desbloqueadas = 0
    let totalTablas = 0
    
    for (const [key, tabla] of Object.entries(tablas)) {
        totalTablas++
        const estaDesbloqueada = nivelActual >= tabla.nivelRequerido
        
        if (estaDesbloqueada) desbloqueadas++
        
        html += `
            <div class="library-item ${estaDesbloqueada ? 'unlocked' : 'locked'}">
                <div class="library-item-icon">${estaDesbloqueada ? tabla.icono : '🔒'}</div>
                <div class="library-item-name">${estaDesbloqueada ? tabla.nombre : '???'}</div>
            </div>
        `
    }
    
    grid.innerHTML = html
    
    if (hint) {
        if (desbloqueadas === totalTablas) {
            hint.innerHTML = '<span>🏆</span> ¡Colección completa!'
            hint.style.color = 'var(--neon-gold)'
        } else {
            hint.innerHTML = `<span>📖</span> ${desbloqueadas}/${totalTablas} tablas desbloqueadas`
        }
    }
    
    overlay.classList.add('active')
    createConfetti({ count: 30, duration: 2000 })
}

function cerrarBiblioteca() {
    const overlay = document.getElementById('library-overlay')
    if (overlay) {
        overlay.classList.remove('active')
    }
}

// ==========================================
// VERIFICAR Y REGALAR TABLA DE LA BIBLIOTECA
// ==========================================

function verificarBonoBiblioteca(nivelCompletado) {
    const tablas = TABLAS_BIBLIOTECA[3]
    
    for (const [key, tabla] of Object.entries(tablas)) {
        if (nivelCompletado === tabla.nivelRequerido && !appState.tablaDesbloqueada) {
            appState.tablaDesbloqueada = key
            
            // Mostrar modal de congratulations
            setTimeout(() => {
                mostrarBonoBiblioteca(key, tabla)
            }, 2000)
            
            return true
        }
    }
    return false
}

function mostrarBonoBiblioteca(key, tabla) {
    showToast(`📚 ¡TABLA DESBLOQUEADA: ${tabla.nombre}!`, 'success')
    createConfetti({ count: 50, duration: 3000 })
    
    // Guardar en perfil del usuario
    guardarTablaDesbloqueada(key)
}

async function guardarTablaDesbloqueada(tablaKey) {
    try {
        console.log(`[Biblioteca] Guardando tabla desbloqueada: ${tablaKey}`)
        // Aquí se podría guardar en la base de datos
        // Por ahora solo en el estado local
    } catch (err) {
        console.error('[Biblioteca] Error al guardar:', err)
    }
}

let miaBaseAnimations = null

function initAppAnimations() {
    const frame = document.getElementById('main-frame')
    const buttons = document.querySelectorAll('button')
    const cards = document.querySelectorAll('.level-card')
    const miaStar = document.getElementById('mia-star-main')

    // Inicializar sistemas de grado
    initGradeSelector()
    initTeoriaListeners()
    initBiblioteca()
    
    // Inicializar grado guardado o default (Grado 3)
    if (!appState.gradoActual) {
        appState.gradoActual = 3
    }
    cambiarGrado(appState.gradoActual)
    
    // Desbloquear tarjetas de mundos según progreso
    actualizarEstadoMundos()

    gsap.from(frame, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out"
    })

    if (miaStar) {
        miaBaseAnimations = gsap.timeline({ repeat: -1 })
        miaBaseAnimations.to(miaStar, { scale: 1.05, duration: 3, yoyo: true, ease: "sine.inOut" })
        miaBaseAnimations.to(miaStar, { rotation: 2, duration: 4, yoyo: true, ease: "sine.inOut" }, 0)

        const parallaxContainer = document.getElementById('mia-parallax');
        if (parallaxContainer) {
            window.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const moveX = (clientX - centerX) / centerX;
                const moveY = (clientY - centerY) / centerY;

                gsap.to(parallaxContainer, {
                    rotationY: moveX * 8,
                    rotationX: -moveY * 8,
                    transformPerspective: 1000,
                    duration: 0.6,
                    ease: "power2.out"
                });

                const layers = parallaxContainer.querySelectorAll('.layer');
                layers.forEach(layer => {
                    const depth = parseFloat(layer.getAttribute('data-depth') || 0.2);
                    gsap.to(layer, {
                        x: moveX * (depth * 30),
                        y: moveY * (depth * 30),
                        duration: 0.8,
                        ease: "power2.out"
                    });
                });
            });
        }

        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(miaStar, { scale: 1.1, x: 10, duration: 0.6, ease: "power2.out" })
            })
            btn.addEventListener('mouseleave', () => {
                gsap.to(miaStar, { scale: 1.05, x: 0, duration: 0.8, ease: "power2.inOut" })
            })
        })
    }

    // 2. Level Cards Entry & Interactivity
    gsap.from(cards, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "elastic.out(1, 0.75)"
    })

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (card.style.cursor !== 'not-allowed') {
                gsap.to(card, { scale: 1.05, borderColor: '#00D4FF', duration: 0.3 })
            }
        })
        card.addEventListener('mouseleave', () => {
            if (card.style.cursor !== 'not-allowed') {
                gsap.to(card, { scale: 1, borderColor: 'rgba(255, 255, 255, 0.1)', duration: 0.3 })
            }
        })
    })

    // 3. Click feedback
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => gsap.to(btn, { scale: 0.95, duration: 0.1 }))
        btn.addEventListener('mouseup', () => gsap.to(btn, { scale: 1, duration: 0.1 }))
    })

    console.log("Mía Star Menu Fully Integrated.")
}

function initInteractions() {
    const btnBack = document.getElementById('btn-back-menu')
    const menuContent = document.getElementById('menu-content')
    const levelsContent = document.getElementById('levels-content')
    const btnToggleAudio = document.getElementById('btn-toggle-audio')
    const btnChangeUser = document.getElementById('btn-change-user')
    const worldCards = document.querySelectorAll('.level-card')
    const worldSelectorGranja = document.getElementById('world-selector-granja')
    const worldSelector = document.getElementById('world-selector')

    console.log(`[initInteractions] worldCards found: ${worldCards.length}`)
    console.log(`[initInteractions] world-selector-granja display: ${worldSelectorGranja?.style.display}`)
    console.log(`[initInteractions] world-selector display: ${worldSelector?.style.display}`)
    
    // Botón Cambiar Usuario
    if (btnChangeUser) {
        btnChangeUser.addEventListener('click', async () => {
            if (confirm('¿Quieres cambiar de usuario? Perderás el progreso no guardado.')) {
                // Obtener todos los perfiles
                const perfilesRes = await obtenerTodosPerfiles()
                if (perfilesRes.success && perfilesRes.data && perfilesRes.data.length > 0) {
                    // Mostrar selector
                    mostrarSelectorUsuarios(perfilesRes.data, () => {
                        // Recargar la página para reiniciar todo
                        window.location.reload()
                    })
                }
            }
        })
    }
    
    // Hover effect para botón cambiar usuario
    if (btnChangeUser) {
        btnChangeUser.addEventListener('mouseenter', () => {
            btnChangeUser.style.background = 'rgba(255,0,255,0.3)'
            btnChangeUser.style.transform = 'scale(1.1)'
        })
        btnChangeUser.addEventListener('mouseleave', () => {
            btnChangeUser.style.background = 'rgba(255,0,255,0.1)'
            btnChangeUser.style.transform = 'scale(1)'
        })
    }

    console.log(`Found ${worldCards.length} world cards. Attaching listeners.`)

    // Click on Mía Avatar - excited reaction
    const miaContainer = document.querySelector('.mia-star-container')
    if (miaContainer) {
        miaContainer.style.cursor = 'pointer'
        miaContainer.addEventListener('click', () => {
            miaExcited()
            const phrases = ['¡Hola! ¿Jugamos?', '¡Qué bueno verte!', '¡准备好了! (¡Listo!)']
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
            hablarMia(randomPhrase, false)
        })
    }

    // World Selection Logic
    worldCards.forEach((card) => {
        card.addEventListener('click', () => {
            const mundoId = parseInt(card.getAttribute('data-mundo-id'))
            const grado = appState.gradoActual || 3
            
            console.log(`[World Click] mundoId=${mundoId}, grado=${grado}, nivelActual=${appState.nivelActual}`)
            
            // Check if world is locked (based on grade)
            let isLocked = false
            
            if (grado === 3) {
                // LA GRANJA - different unlock logic
                if (mundoId === 6 && appState.nivelActual < 6) isLocked = true // Mundo 2 (Resta)
                if (mundoId === 11 && appState.nivelActual < 11) isLocked = true // Mundo 3 (Multiplicación)
                if (mundoId === 16 && appState.nivelActual < 16) isLocked = true // Mundo 4 (División)
            } else {
                // EL MUNDO DE MÍA - original logic
                if (mundoId === 2 && appState.nivelActual < 11) isLocked = true
                if (mundoId === 3 && appState.nivelActual < 16) isLocked = true
            }
            
            if (isLocked) {
                reproducirVoz('error')
                gsap.to(card, { x: 10, duration: 0.1, repeat: 5, yoyo: true })
                showToast('🔒 Completa el mundo anterior primero', 'info')
                return
            }

            appState.mundoActual = mundoId
            changeWorldTheme(mundoId)
            
            const levelsModal = document.getElementById('levels-modal')
            if (levelsModal) {
                levelsModal.style.display = 'flex'
                gsap.fromTo(levelsModal, { opacity: 0 }, { opacity: 1, duration: 0.5 })
                
                // Mía greetings based on world
                if (mundoId === 1) triggerMiaWelcome()
                if (mundoId === 6 || mundoId === 11 || mundoId === 16) {
                    // Granja worlds
                    reproducirVoz('mundo_2_bienvenida')
                }
                if (mundoId === 2) reproducirVoz('mundo_2_bienvenida')
                if (mundoId === 3) reproducirVoz('mundo_3_bienvenida')
                renderLevels(mundoId, grado)
            }
        })
    })

    // Close Levels Modal
    const btnCloseLevels = document.getElementById('btn-close-levels')
    if (btnCloseLevels) {
        btnCloseLevels.addEventListener('click', () => {
            const levelsModal = document.getElementById('levels-modal')
            detenerVoz()
            gsap.to(levelsModal, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    levelsModal.style.display = 'none'
                    // Regresar al estado del Sistema Central
                    appState.mundoActual = 0
                    changeWorldTheme(0)
                }
            })
        })
    }


    // Toggle Audio (Bongo or Synthwave)
    if (btnToggleAudio) {
        btnToggleAudio.addEventListener('click', () => {
            const audio = appState.mundoActual === 1 ? window.bgmAudio : window.bgmAudio
            if (!audio) return

            window.audioIsMuted = !window.audioIsMuted
            if (window.audioIsMuted) {
                gsap.to(audio, { volume: 0, duration: 1 })
                btnToggleAudio.innerText = '🔇'
            } else {
                const targetVol = window.isMiaTalking ? 0.15 : 0.35
                gsap.to(audio, { volume: targetVol, duration: 1 })
                btnToggleAudio.innerText = '🔊'
            }
        })
    }


    // Botón ¡Vamos! Action


    // Botón ¡Vamos! Action
    const btnVamos = document.getElementById('btn-vamos')
    const speechBubble = document.getElementById('mia-dialogue')
    if (btnVamos && speechBubble) {
        btnVamos.addEventListener('click', () => {
            detenerVoz()
            playWorldBGM()

            gsap.to(speechBubble, {
                opacity: 0,
                x: 20,
                duration: 0.4,
                onComplete: () => {
                    speechBubble.style.display = 'none'
                    const currentLevel = document.querySelector('.level-node.current')
                    if (currentLevel) {
                        gsap.fromTo(currentLevel,
                            { scale: 1 },
                            { scale: 1.15, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }
                        )
                    }
                }
            })
        })
    }

    // Lupa (Trick) Continue Button
    const btnLupaCont = document.getElementById('btn-lupa-continuar')
    const lupaOverlay = document.getElementById('lupa-overlay')
    const challengeModal = document.getElementById('challenge-modal')
    
    if (btnLupaCont && challengeModal) {
        btnLupaCont.addEventListener('click', () => {
            gsap.to(lupaOverlay, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    lupaOverlay.style.display = 'none'
                    
                    // Show the challenge modal with proper animation
                    challengeModal.style.display = 'flex'
                    challengeModal.style.opacity = '1'
                    
                    // Animate the challenge box
                    const challengeBox = challengeModal.querySelector('.challenge-box')
                    if (challengeBox) {
                        gsap.fromTo(challengeBox, 
                            { opacity: 0, scale: 0.8, y: 20 },
                            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
                        )
                    }
                }
            })
        })
    }


    // Botón para cerrar modal
    const btnCloseModal = document.getElementById('btn-close-modal')
    const closeModal = document.getElementById('challenge-modal')
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            detenerVoz()
            gsap.to(closeModal, {
                opacity: 0,
                scale: 0.9,
                duration: 0.4,
                onComplete: () => {
                    closeModal.style.display = 'none'
                    renderLevels(appState.mundoActual)
                }
            })
        })
    }


    // Botón para cerrar la burbuja de Mía
    const btnCloseBubble = document.getElementById('btn-close-bubble')
    if (btnCloseBubble && speechBubble) {
        btnCloseBubble.addEventListener('click', () => {
            detenerVoz()
            gsap.to(speechBubble, {
                opacity: 0,
                x: 20,
                duration: 0.4,
                onComplete: () => {
                    speechBubble.style.display = 'none'
                }
            })
        })
    }

    // Reset Progress
    const btnResetContent = document.getElementById('btn-reset-progress')
    if (btnResetContent) {
        btnResetContent.addEventListener('click', async () => {
            const confirmReset = window.confirm('¿Estás seguro que quieres reiniciar los retos de este mundo?')
            if (confirmReset) {
                let startLevel = 1;
                if (appState.mundoActual === 2) startLevel = 11;
                if (appState.mundoActual === 3) startLevel = 16;
                
                // Actualizar DB con el nivel de reinicio del mundo actual
                const updateResult = await actualizarProgreso(parseInt(appState.puntosTotales) || 0, startLevel)
                if (updateResult && updateResult.success) {
                    appState.nivelActual = startLevel
                    updateHUD()
                    renderLevels(appState.mundoActual)
                }
            }
        })
    }
}

// ==========================================
// WORLD THEME & PARTICLES SYSTEM
// ==========================================
function changeWorldTheme(mundoId) {
    document.body.setAttribute('data-mundo', mundoId)
    const title = document.getElementById('main-title')
    const subtitle = title.nextElementSibling
    const particlesContainer = document.getElementById('crystal-particles')
    
    // Reset particles
    if (particlesContainer) particlesContainer.innerHTML = ''

    if (mundoId === 2) {
        title.innerText = "CIUDAD CRISTAL"
        subtitle.innerText = "TECNOLOGÍA Y LÓGICA"
        createCrystalParticles()
    } else if (mundoId === 3) {
        title.innerText = "TEMPLO DE CIRCUITOS"
        subtitle.innerText = "NÚCLEO DE DATOS"
        createCircuitParticles()
    } else {
        title.innerText = "SISTEMA CENTRAL"
        subtitle.innerText = "MÓDULOS ACTIVOS"
    }

    // Switch music
    if (window.bgmAudio) {
        window.bgmAudio.pause()
        window.bgmAudio = null
    }
    setTimeout(() => playWorldBGM(), 300)
}

function createCircuitParticles() {
    const container = document.getElementById('crystal-particles')
    if (!container) return
    
    const particleCount = 25
    const colors = ['gold', 'cyan', 'lila']
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = `circuit-particle ${colors[i % colors.length]}`
        particle.style.left = `${Math.random() * 100}%`
        particle.style.setProperty('--dur', `${4 + Math.random() * 4}s`)
        particle.style.setProperty('--delay', `${Math.random() * 5}s`)
        container.appendChild(particle)
    }
}

function createCrystalParticles() {
    const container = document.getElementById('crystal-particles')
    if (!container) return
    
    container.innerHTML = ''
    
    // More particles for Mundo 2 with varied sizes
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div')
        p.className = 'crystal-particle'
        p.style.left = `${Math.random() * 100}vw`
        
        // Varied sizes for more visual interest
        const size = 4 + Math.random() * 8
        p.style.width = `${size}px`
        p.style.height = `${size}px`
        
        p.style.setProperty('--dur', `${8 + Math.random() * 8}s`)
        p.style.setProperty('--delay', `${Math.random() * 12}s`)
        
        // Add different shapes
        if (i % 3 === 0) {
            p.style.borderRadius = '50%' // Circle
        } else if (i % 3 === 1) {
            p.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // Diamond
        }
        // Third type is default square
        
        container.appendChild(p)
    }
}


// ==========================================
// SOUND SYSTEM & IMMERSION
// ==========================================

const BGM_TRACKS = {
    central: '/The_Jungle.mp3',
    mundo1: '/selva_nocturna.mp3',
    mundo2: '/ciudadCristal.mp3',
    mundo3: '/pajaros_mañana.mp3',
    granja: '/melodia_farm_mia.mp3'
}

function playWorldBGM() {
    if (window.bgmAudio) {
        window.bgmAudio.pause()
        window.bgmAudio = null
    }

    let url = BGM_TRACKS.central
    
    // Granja (Grado 3)
    if (appState.gradoActual === 3) {
        url = BGM_TRACKS.granja
    } else if (appState.mundoActual === 1) {
        url = BGM_TRACKS.mundo1
    } else if (appState.mundoActual === 2) {
        url = BGM_TRACKS.mundo2
    } else if (appState.mundoActual === 3) {
        url = BGM_TRACKS.mundo3
    }

    console.log(`[Audio] Reproduciendo: ${url} (mundo: ${appState.mundoActual}, muted: ${window.audioIsMuted})`)

    window.bgmAudio = new Audio(url)
    window.bgmAudio.loop = true
    
    // Volumen inicial - si está muteado, reproducir a 0 sino a 30%
    const initialVol = window.audioIsMuted ? 0 : 0.3
    window.bgmAudio.volume = initialVol

    const playPromise = window.bgmAudio.play()

    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('[Audio] Reproducción iniciada')
            // Aumentar volumen gradualmente si no está muteado
            if (!window.audioIsMuted) {
                const targetVol = window.isMiaTalking ? 0.1 : 0.4
                gsap.to(window.bgmAudio, { volume: targetVol, duration: 2, ease: "power2.out" })
            }
        }).catch(error => {
            console.warn('[Audio] Error en autoplay:', error.message)
            // Intentar reproducir después de interacción del usuario
            window._bgmPendingPlay = true
            // Mostrar botón de activar audio
            showActivateAudioButton()
        })
    }
}

let miaLipsyncAnim = null

export function hablarMia(texto, isBienvenida = false) {
    if (!texto) return;

    window.isMiaTalking = true;

    // UI elements
    const bubble = document.getElementById('mia-dialogue');
    const textEl = document.getElementById('mia-text');
    const btnVamos = document.getElementById('btn-vamos');

    // Reset state
    if (textEl) textEl.innerHTML = "";
    if (btnVamos) btnVamos.style.display = 'none';
    if (bubble) {
        bubble.style.display = 'block';
        gsap.fromTo(bubble, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5 });
    }

    // Audio Ducking (10% de volumen)
    if (window.bgmAudio && !window.audioIsMuted) {
        gsap.to(window.bgmAudio, { volume: 0.1, duration: 0.5 });
    }

    // Limpiar audios previos
    detenerPistasVoz();

    // Lipsync Animation & Parallax Sync
    const avatar = document.getElementById('mia-star-main');
    if (avatar) {
        if (miaLipsyncAnim) miaLipsyncAnim.kill();
        miaLipsyncAnim = gsap.to(avatar, { scaleY: 1.03, scaleX: 0.98, yoyo: true, repeat: -1, duration: 0.15, ease: 'sine.inOut' });
    }

    // Typewriter Effect logic
    let i = 0;
    function typeWriter() {
        // Run typewriter while TTS is speaking or until text finishes
        if (i < texto.length) {
            if (textEl) textEl.innerHTML += texto.charAt(i);
            i++;
            // Velocidad sincronizada aprox con el habla
            setTimeout(typeWriter, 55); 
        } else {
            if (isBienvenida && btnVamos) {
                gsap.fromTo(btnVamos, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, display: 'inline-block', duration: 0.3 });
            }
        }
    }

    // Web Speech API
    const utterance = new SpeechSynthesisUtterance(texto);
    
    const ejecutarVoz = () => {
        let voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v =>
            (v.lang.includes('es') || v.lang === 'es-ES' || v.lang === 'es-MX') &&
            (v.name.includes('Sabina') || v.name.includes('Monica') || v.name.includes('Paulina') || v.name.includes('Helena') || v.name.includes('Google') || v.name.includes('Microsoft') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('mujer'))
        ) || voices.find(v => v.lang.includes('es'));
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        } else {
            console.warn("No se encontró voz en español o femenina. Usando default.");
        }
        
        utterance.lang = 'es-ES';
        utterance.rate = 1.15;
        utterance.pitch = 1.2;
        utterance.volume = 0.6; // Volumen de voz al 60%

        window._miaUtterance = utterance;

        utterance.onend = () => {
            window._miaUtterance = null;
            detenerVoz();
        }
        utterance.onerror = (e) => {
            console.error("Speech Synthesis Error:", e);
            window._miaUtterance = null;
            detenerVoz();
        }
        
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
        
        typeWriter();
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', ejecutarVoz, { once: true });
    } else {
        ejecutarVoz();
    }
}

// Botón para activar audio cuando el navegador bloqea el autoplay
function showActivateAudioButton() {
    const existingBtn = document.getElementById('btn-activate-audio')
    if (existingBtn) return

    const btn = document.createElement('button')
    btn.id = 'btn-activate-audio'
    btn.innerText = '🔊 ACTIVAR AUDIO'
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #FF00FF, #00D4FF);
        border: none;
        border-radius: 30px;
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        animation: pulse 2s infinite;
    `
    
    const style = document.createElement('style')
    style.textContent = `@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`
    document.head.appendChild(style)
    
    btn.addEventListener('click', () => {
        if (window.bgmAudio) {
            window.bgmAudio.play().then(() => {
                gsap.to(window.bgmAudio, { volume: 0.4, duration: 1 })
            })
        }
        window._bgmPendingPlay = false
        btn.remove()
    })
    
    document.body.appendChild(btn)
}

// Inicialización global para "despertar" el audio en navegadores modernos
document.addEventListener('click', () => {
    // Despertar voz
    if (!window._vozDespierta) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
        window._vozDespierta = true;
    }
    
    // Reproducir BGM si está pendiente o muteado
    const splashOculto = document.querySelector('#splash-screen')?.style.display === 'none'
    
    if (window._bgmPendingPlay && splashOculto) {
        window._bgmPendingPlay = false
        window.bgmAudio.play().then(() => {
            if (!window.audioIsMuted) {
                gsap.to(window.bgmAudio, { volume: 0.4, duration: 2 })
            }
        }).catch(e => console.warn('[Audio] Error al reproducir:', e))
    }
    
    // Si el BGM existe pero está muteado por volumen 0, restaurar
    if (window.bgmAudio && window.bgmAudio.volume === 0 && !window.audioIsMuted) {
        gsap.to(window.bgmAudio, { volume: 0.4, duration: 1 })
    }
}, { once: false });

export async function reproducirVoz(tipo, customData = null) {
    const data = customData || VOCES_MIA[tipo];
    if (!data) return;
    
    // Reproducir audio si existe
    if (data.url) {
        try {
            // Extraer nombre de archivo
            const filename = data.url.split('/').pop()
            const url = await getAudioUrlLocal(filename)
            if (url && window.audioIsMuted === false) {
                const audio = new Audio(url)
                audio.volume = 0.8
                await audio.play().catch(e => console.warn('[Audio] Play error:', e.message))
            }
        } catch (e) {
            console.warn('[Audio] Error reproduciendo:', e.message)
        }
    }
    
    // Redirigir la llamada al nuevo motor por defecto
    hablarMia(data.texto, tipo === 'bienvenida');
}

function detenerPistasVoz() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function detenerVoz() {
    window.isMiaTalking = false;
    // Ya no llamamos a cancelar inmediatamente para no romper el onend,
    // pero actualizamos UI.

    // End lipsync animation
    if (miaLipsyncAnim) {
        miaLipsyncAnim.kill();
        miaLipsyncAnim = null;
    }
    const avatar = document.getElementById('mia-star-main');
    if (avatar) gsap.to(avatar, { scaleY: 1, scaleX: 1, duration: 0.2 });

    // BGM Ducking Revert (Regresar al 40%)
    if (window.bgmAudio && !window.audioIsMuted) {
        gsap.to(window.bgmAudio, { volume: 0.40, duration: 1 });
    }

    // Auto-close bubble si Mía ya no espera que hagas clic en '¡Vamos!'
    const bubble = document.getElementById('mia-dialogue');
    const btnVamos = document.getElementById('btn-vamos');
    if (bubble && bubble.style.display !== 'none') {
        if (btnVamos && btnVamos.style.display === 'none') {
            setTimeout(() => {
                // Verificar que no haya empezado a hablar otra vez
                if (!window.isMiaTalking && !window.speechSynthesis.speaking) {
                    gsap.to(bubble, {
                        opacity: 0,
                        x: 20,
                        duration: 0.5,
                        onComplete: () => {
                            bubble.style.display = 'none';
                        }
                    });
                }
            }, 1000);
        }
    }
}

let miaExpressionAnim = null

export function miaLaugh() {
    const avatar = document.getElementById('mia-star-main')
    const container = document.querySelector('.mia-star-container')
    if (!avatar) return

    if (miaExpressionAnim) miaExpressionAnim.kill()

    miaExpressionAnim = gsap.timeline()
    
    miaExpressionAnim.to(avatar, { 
        scale: 1.15, 
        rotation: 5, 
        duration: 0.15, 
        ease: "power2.out" 
    })
    .to(avatar, { 
        scale: 0.95, 
        rotation: -3, 
        duration: 0.1, 
        ease: "power2.inOut" 
    })
    .to(avatar, { 
        scale: 1.1, 
        rotation: 3, 
        duration: 0.1, 
        ease: "power2.inOut" 
    })
    .to(avatar, { 
        scale: 0.98, 
        rotation: -2, 
        duration: 0.1, 
        ease: "power2.inOut" 
    })
    .to(avatar, { 
        scale: 1.05, 
        rotation: 0, 
        duration: 0.2, 
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
            if (miaBaseAnimations && !miaBaseAnimations.isActive()) {
                gsap.to(avatar, { scale: 1.05, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" })
                gsap.to(avatar, { rotation: 2, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" })
            }
        }
    })

    if (container) {
        gsap.to(container, {
            boxShadow: "0 0 40px rgba(255, 0, 255, 0.8), 0 0 60px rgba(255, 0, 255, 0.4)",
            borderColor: "rgba(255, 0, 255, 0.8)",
            duration: 0.3,
            onComplete: () => {
                gsap.to(container, {
                    boxShadow: "0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)",
                    borderColor: "rgba(0, 212, 255, 0.4)",
                    duration: 0.5
                })
            }
        })
    }
}

export function miaExcited() {
    const avatar = document.getElementById('mia-star-main')
    const container = document.querySelector('.mia-star-container')
    if (!avatar) return

    if (miaExpressionAnim) miaExpressionAnim.kill()

    miaExpressionAnim = gsap.timeline()
    
    miaExpressionAnim.to(avatar, { 
        scale: 1.25, 
        y: -10, 
        duration: 0.2, 
        ease: "back.out(1.7)" 
    })
    .to(avatar, { 
        scale: 1.1, 
        y: 0, 
        duration: 0.15, 
        ease: "power2.out" 
    })
    .to(avatar, { 
        scale: 1.2, 
        y: -5, 
        duration: 0.15, 
        ease: "power2.inOut" 
    })
    .to(avatar, { 
        scale: 1.05, 
        y: 0, 
        duration: 0.3, 
        ease: "elastic.out(1, 0.5)" 
    })

    if (container) {
        gsap.to(container, {
            boxShadow: "0 0 50px rgba(0, 212, 255, 1), 0 0 80px rgba(0, 212, 255, 0.6)",
            borderColor: "rgba(0, 212, 255, 1)",
            duration: 0.2,
            onComplete: () => {
                gsap.to(container, {
                    boxShadow: "0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)",
                    borderColor: "rgba(0, 212, 255, 0.4)",
                    duration: 0.6
                })
            }
        })
    }
}

export function miaThink() {
    const avatar = document.getElementById('mia-star-main')
    if (!avatar) return

    if (miaExpressionAnim) miaExpressionAnim.kill()

    miaExpressionAnim = gsap.timeline()
    
    miaExpressionAnim.to(avatar, { 
        scaleX: 0.9, 
        scaleY: 1.1, 
        rotation: -3, 
        duration: 0.4, 
        ease: "power2.out" 
    })
    .to(avatar, { 
        scaleX: 0.95, 
        scaleY: 1.05, 
        rotation: 0, 
        duration: 0.6, 
        ease: "sine.inOut" 
    })
    .to(avatar, { 
        scaleX: 1.05, 
        scaleY: 0.95, 
        rotation: 3, 
        duration: 0.4, 
        ease: "power2.inOut" 
    })
    .to(avatar, { 
        scale: 1, 
        rotation: 0, 
        duration: 0.3 
    })
}

function triggerMiaWelcome() {
    reproducirVoz('bienvenida');
}

export async function lanzarFeedbackPedagogico(nivelId) {
    try {
        const { data: retoData } = await obtenerRetoNivel(nivelId);
        // Utiliza la columna `explicacion` de nuestra tabla de Supabase (Database)
        const explanationText = retoData?.explicacion || "¡Muy bien hecho!";
        
        setTimeout(() => {
            // Pasamos directo al nuevo motor de voz TTS
            hablarMia(explanationText, false);
        }, 1500);
    } catch (err) {
        console.error("Error in pedagogical feedback:", err);
    }
}

async function triggerWorld1Completion() {
    console.log("--- MUNDO 1 COMPLETADO ---");
    
    const challengeModal = document.getElementById('challenge-modal')
    const levelsModal = document.getElementById('levels-modal')
    
    if (challengeModal) {
        gsap.to(challengeModal, { opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => {
            challengeModal.style.display = 'none'
        }})
    }

    if (levelsModal) {
        gsap.to(levelsModal, { opacity: 0, scale: 0.9, duration: 0.4, onComplete: () => {
            levelsModal.style.display = 'none'
        }})
    }

    if (window.bgmAudio) gsap.to(window.bgmAudio, { volume: 0, duration: 0.5 })

    // Usar el overlay existente del HTML
    const overlay = document.getElementById('world-complete-overlay')
    const title = document.getElementById('world-complete-title')
    const message = document.getElementById('world-complete-message')
    const continueBtn = document.getElementById('btn-world-complete-continue')
    
    if (overlay && title && message) {
        title.innerText = '🎉 ¡BOSQUE NEÓN COMPLETADO! 🎉'
        title.style.color = 'var(--neon-blue)'
        message.innerText = 'Has conquistado el primer mundo'
        
        overlay.classList.add('active')
        
        // Lanzar confeti
        createConfetti({ count: 80, duration: 4000 })
        
        gsap.fromTo(title, { scale: 0, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 0.3 })
        
        setTimeout(() => {
            reproducirVoz('mundo_1_completado')
            miaExcited()
        }, 1500)

        const handleContinue = () => {
            overlay.classList.remove('active')
            
            appState.mundoActual = 0
            changeWorldTheme(0)
            
            const mundo2Card = document.getElementById('world-2-card')
            if (mundo2Card) {
                mundo2Card.classList.remove('world-locked')
                mundo2Card.classList.remove('neon-glow-cyan')
                mundo2Card.classList.add('neon-glow-pink')
                mundo2Card.style.filter = 'none'
                mundo2Card.style.opacity = '1'
                document.getElementById('world-2-status').innerText = '¡ENTRA AL MUNDO 2!'
                
                gsap.fromTo(mundo2Card,
                    { scale: 1, rotation: 0 },
                    { scale: 1.1, rotation: 5, duration: 0.3, yoyo: true, repeat: 2, ease: "power2.out" }
                )
            }

            // Mostrar bonus aleatorio (ruleta o desafío rápido)
            setTimeout(() => {
                showBonus(async (bonusPoints) => {
                    if (bonusPoints > 0) {
                        appState.puntosTotales = (appState.puntosTotales || 0) + bonusPoints
                        updateHUD()
                        
                        // Guardar puntos bonus en la base de datos
                        try {
                            await actualizarProgreso(appState.puntosTotales, appState.nivelActual)
                            console.log(`[Mundo Bonus] Guardados ${bonusPoints} puntos. Total: ${appState.puntosTotales}`)
                        } catch (err) {
                            console.error('[Mundo Bonus] Error al guardar puntos:', err)
                        }
                        
                        if (typeof showToast === 'function') {
                            showToast(`🎁 ¡+${bonusPoints} puntos bonus!`, 'success')
                        }
                    }
                    playWorldBGM()
                    miaLaugh()
                    triggerHaptic('success')
                })
            }, 500)
        }

        continueBtn.onclick = handleContinue
        addTouchFeedback(continueBtn, { haptic: 'medium' })
    }
}

async function triggerWorld2Completion() {
    console.log("--- MUNDO 2 COMPLETADO ---");
    
    const challengeModal = document.getElementById('challenge-modal')
    const levelsModal = document.getElementById('levels-modal')
    
    if (challengeModal) {
        gsap.to(challengeModal, { opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => {
            challengeModal.style.display = 'none'
        }})
    }

    if (levelsModal) {
        gsap.to(levelsModal, { opacity: 0, scale: 0.9, duration: 0.4, onComplete: () => {
            levelsModal.style.display = 'none'
        }})
    }

    if (window.bgmAudio) gsap.to(window.bgmAudio, { volume: 0, duration: 0.5 })

    // Usar el overlay existente del HTML
    const overlay = document.getElementById('world-complete-overlay')
    const title = document.getElementById('world-complete-title')
    const message = document.getElementById('world-complete-message')
    const continueBtn = document.getElementById('btn-world-complete-continue')
    
    if (overlay && title && message) {
        title.innerText = '🎉 ¡CIUDAD CRISTAL COMPLETADA! 🎉'
        title.style.color = '#00FFFF'
        message.innerText = 'Has conquistado el segundo mundo'
        
        overlay.classList.add('active')
        
        // Lanzar confeti
        createConfetti({ count: 100, duration: 5000 })
        
        gsap.fromTo(title, { scale: 0, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 0.3 })
        
        setTimeout(() => {
            reproducirVoz('mundo_2_completado')
            miaExcited()
        }, 1500)

        const handleContinue = () => {
            overlay.classList.remove('active')
            
            appState.mundoActual = 0
            changeWorldTheme(0)
            
            const mundo3Card = document.getElementById('world-3-card')
            if (mundo3Card) {
                mundo3Card.classList.remove('world-locked')
                mundo3Card.classList.add('neon-glow-gold')
                mundo3Card.style.filter = 'none'
                mundo3Card.style.opacity = '1'
                document.getElementById('world-3-status').innerText = '¡ENTRA AL MUNDO 3!'
                
                gsap.fromTo(mundo3Card,
                    { scale: 1, rotation: 0 },
                    { scale: 1.1, rotation: 5, duration: 0.3, yoyo: true, repeat: 2, ease: "power2.out" }
                )
            }

            // Mostrar bonus aleatorio (ruleta o desafío rápido)
            setTimeout(() => {
                showBonus(async (bonusPoints) => {
                    if (bonusPoints > 0) {
                        appState.puntosTotales = (appState.puntosTotales || 0) + bonusPoints
                        updateHUD()
                        
                        // Guardar puntos bonus en la base de datos
                        try {
                            await actualizarProgreso(appState.puntosTotales, appState.nivelActual)
                            console.log(`[Mundo 1 Bonus] Guardados ${bonusPoints} puntos. Total: ${appState.puntosTotales}`)
                        } catch (err) {
                            console.error('[Mundo 1 Bonus] Error al guardar puntos:', err)
                        }
                        
                        // Mostrar toast con puntos ganados
                        if (typeof showToast === 'function') {
                            showToast(`🎁 ¡+${bonusPoints} puntos bonus!`, 'success')
                        }
                    }
                    playWorldBGM()
                    miaLaugh()
                    triggerHaptic('success')
                })
            }, 500)
        }

        continueBtn.onclick = handleContinue
    }
}

async function renderLevels(mundoId = 1, grado = 3) {
    console.log(`[renderLevels] Starting - mundoId=${mundoId}, grado=${grado}`)
    const container = document.getElementById('levels-container')
    const levelsTitle = document.getElementById('levels-title')
    
    if (levelsTitle) {
        if (grado === 3) {
            // GRADO 3: LA GRANJA
            if (mundoId === 1) levelsTitle.innerText = "COSECHA DE NÚMEROS"
            else if (mundoId === 6) levelsTitle.innerText = "LIMPIEZA DE MALEZA"
            else if (mundoId === 11) levelsTitle.innerText = "DUPLICADOR DE SEMILLAS"
            else if (mundoId === 16) levelsTitle.innerText = "REPARTO DEL GRANERO"
        } else {
            // GRADO 4: EL MUNDO DE MÍA
            if (mundoId === 1) levelsTitle.innerText = "BOSQUE NEÓN"
            else if (mundoId === 2) levelsTitle.innerText = "CIUDAD CRISTAL"
            else if (mundoId === 3) levelsTitle.innerText = "TEMPLO DE CIRCUITOS"
        }
    }

    if (!container) return

    const res = await obtenerNivelesConfig()
    let niveles = []

    if (res.success && res.data && res.data.length > 0) {
        // Usar == para comparar numero vs string indistintamente
        niveles = res.data.filter(n => {
            if (grado === 3) {
                // GRADO 3: LA GRANJA
                if (mundoId === 1) return n.numero_nivel >= 1 && n.numero_nivel <= 5
                if (mundoId === 6) return n.numero_nivel >= 6 && n.numero_nivel <= 10
                if (mundoId === 11) return n.numero_nivel >= 11 && n.numero_nivel <= 15
                if (mundoId === 16) return n.numero_nivel >= 16 && n.numero_nivel <= 20
            } else {
                // GRADO 4: EL MUNDO DE MÍA
                if (mundoId === 1) return n.numero_nivel >= 1 && n.numero_nivel <= 10
                if (mundoId === 2) return n.numero_nivel >= 11 && n.numero_nivel <= 15
                if (mundoId === 3) return n.numero_nivel >= 16 && n.numero_nivel <= 20
            }
            return false
        })
        
        // Si el filtro no devolvió nada, usar el fallback
        if (niveles.length === 0) {
            console.warn(`No levels found for world ${mundoId} in DB. Using fallback.`)
            let start = 1, end = 5
            if (mundoId === 6) { start = 6; end = 10 }
            if (mundoId === 11) { start = 11; end = 15 }
            if (mundoId === 16) { start = 16; end = 20 }
            if (mundoId === 2) { start = 11; end = 15 }
            if (mundoId === 3) { start = 16; end = 20 }
            for (let i = start; i <= end; i++) {
                niveles.push({ nivel_id: i, numero_nivel: i, nombre: `Nivel ${i}`, activo: true })
            }
        }
    } else {
        // Fallback local robusto
        console.warn("Niveles no encontrados en DB. Cargando fallback local.")
        let start = 1, end = 5
        if (mundoId === 6) { start = 6; end = 10 }
        if (mundoId === 11) { start = 11; end = 15 }
        if (mundoId === 16) { start = 16; end = 20 }
        if (mundoId === 2) { start = 11; end = 15 }
        if (mundoId === 3) { start = 16; end = 20 }
        for (let i = start; i <= end; i++) {
            niveles.push({ nivel_id: i, numero_nivel: i, nombre: `Nivel ${i}`, activo: true })
        }
    }



    container.innerHTML = ''

    // GRADO 3: LA GRANJA icons
    const granjaIcons = {
        1: '🥕', 2: '🥕', 3: '🥕', 4: '🥕', 5: '🥕',
        6: '🌿', 7: '🌿', 8: '🌿', 9: '🌿', 10: '🌿',
        11: '🌻', 12: '🌻', 13: '🌻', 14: '🌻', 15: '🌻',
        16: '🏠', 17: '🏠', 18: '🏠', 19: '🏠', 20: '🏠'
    }

    const granjaNames = {
        1: 'Zanahoria', 2: 'Zanahoria', 3: 'Zanahoria', 4: 'Zanahoria', 5: 'Zanahoria',
        6: 'Maleza', 7: 'Maleza', 8: 'Maleza', 9: 'Maleza', 10: 'Maleza',
        11: 'Girasol', 12: 'Girasol', 13: 'Girasol', 14: 'Girasol', 15: 'Girasol',
        16: 'Granero', 17: 'Granero', 18: 'Granero', 19: 'Granero', 20: 'Granero'
    }

    // GRADO 4: EL MUNDO DE MÍA icons
    const mundoMiaIcons = {
        1: '🌱', 2: '🦋', 3: '🌸', 4: '🐞', 5: '🌿',
        6: '🦊', 7: '🌺', 8: '🐝', 9: '🍄', 10: '🦉',
        11: '💠', 12: '🔷', 13: '⚡', 14: '🔮', 15: '💎',
        16: '🔋', 17: '📡', 18: '💾', 19: '🧬', 20: '🌀'
    }

    const mundoMiaNames = {
        1: 'Brote', 2: 'Mariposa', 3: 'Flor', 4: 'Cucaracha', 5: 'Hierba',
        6: 'Zorro', 7: 'Buganvilla', 8: 'Abeja', 9: 'Champiñón', 10: 'Búho',
        11: 'Núcleo', 12: 'Prisma', 13: 'Voltio', 14: 'Orbe', 15: 'Gema',
        16: 'Energía', 17: 'Señal', 18: 'Memoria', 19: 'Código', 20: 'Portal'
    }

    niveles.forEach((nivel) => {
        const num = nivel.nivel_id || nivel.numero_nivel
        const isCurrent = appState.nivelActual === num
        const isCompleted = num < appState.nivelActual
        const isLocked = num > appState.nivelActual

        let stateClass = ''
        let iconHtml = ''
        const levelIcon = grado === 3 
            ? (granjaIcons[num] || '🌾')
            : (mundoMiaIcons[num] || '✨')
        const levelName = grado === 3
            ? (granjaNames[num] || 'Nivel')
            : (mundoMiaNames[num] || 'Nivel')

        if (isLocked) {
            stateClass = 'locked'
            iconHtml = '<div class="level-icon" style="color:#aaa;">🔒</div>'
        } else if (isCurrent) {
            stateClass = 'current glass-panel'
            iconHtml = `<div class="level-icon" style="color:#00D4FF;">⭐</div>`
        } else if (isCompleted) {
            stateClass = 'completed glass-panel'
            iconHtml = `<div class="level-icon" style="color:#FF00FF;">✓</div>`
        }
        
        const card = document.createElement('div')
        card.className = `level-node ${stateClass}`
        
        const iconStyle = isLocked ? 'filter: grayscale(1); opacity: 0.5;' : ''
        const iconColor = isCompleted ? '#FF00FF' : (isCurrent ? '#00D4FF' : '#00D4FF')
        
        card.innerHTML = `
            <div class="level-flora-fauna" style="font-size: 1.4rem; margin-bottom: 2px; ${iconStyle}">${levelIcon}</div>
            ${iconHtml}
            <div class="level-number">${num.toString().padStart(2, '0')}</div>
            <div style="font-size: 0.45rem; opacity: 0.7; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; color: ${isCompleted ? '#FF00FF' : (isCurrent ? '#00D4FF' : '#aaa')};">${levelName}</div>
        `


        // Interaction
        if (!isLocked) {
            card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.05, duration: 0.2 }))
            card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.2 }))
            card.addEventListener('click', () => iniciarReto(num))
        }

        container.appendChild(card)
    })


    const renderCards = document.querySelectorAll('.level-node')
    gsap.fromTo(renderCards,
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)", stagger: 0.05 }
    )
}

// ==========================================
// CHALLENGE SYSTEM LOGIC (RETOS)
// ==========================================
async function iniciarReto(nivelNum) {
    const portal = document.getElementById('portal-overlay')
    console.log(`[Game] Iniciar Reto para nivel: ${nivelNum}`)
    
    if (!portal) return

    const grado = appState.gradoActual || 3

    // Determinar el mundo actual basándose en el nivel
    let mundoDelNivel = appState.mundoActual
    if (mundoDelNivel === 0) {
        if (nivelNum >= 1 && nivelNum <= 5) mundoDelNivel = 1
        else if (nivelNum >= 6 && nivelNum <= 10) mundoDelNivel = 6
        else if (nivelNum >= 11 && nivelNum <= 15) mundoDelNivel = 11
        else if (nivelNum >= 16 && nivelNum <= 20) mundoDelNivel = 16
    }

    // Show Portal Animation
    portal.style.display = 'flex'
    gsap.to(portal, { opacity: 1, duration: 0.5 })

    try {
        // Obtener el reto según el grado
        let retoRes
        if (grado === 3) {
            // GRADO 3: LA GRANJA - usar retos_fallback_grado3
            const { obtenerRetoGrado3 } = await import('./src/retos_fallback_grado3.js')
            const retoData = obtenerRetoGrado3(nivelNum)
            retoRes = { success: !!retoData, data: retoData }
        } else {
            // GRADO 4: EL MUNDO DE MÍA - usar DB o fallback original
            retoRes = await obtenerRetoNivel(nivelNum)
        }
        
        console.log(`[DB] Reto data:`, retoRes)

        setTimeout(async () => {
            await gsap.to(portal, {
                opacity: 0, 
                duration: 0.5, 
                onComplete: () => {
                    portal.style.display = 'none'

                    if (!retoRes.success || !retoRes.data) {
                        // Fallback: completar con 100 puntos
                        console.warn(`[Game] No hay reto para nivel ${nivelNum}, usando fallback`)
                        completarReto(100, nivelNum)
                        return
                    }

                    const retoData = retoRes.data

                    // GRADO 3: Mostrar MÍA TEORÍA primero
                    if (grado === 3 && retoData.teoria_texto) {
                        const mostrarTeoria = mostrarTeoriaMia(retoData)
                        if (mostrarTeoria) {
                            const btnUnderstood = document.getElementById('btn-teoria-understood')
                            if (btnUnderstood) {
                                btnUnderstood.onclick = () => {
                                    cerrarTeoriaMia(() => {
                                        renderModalReto(retoData, false)
                                    })
                                }
                            } else {
                                renderModalReto(retoData, false)
                            }
                            return
                        }
                    }

                    // Mostrar el reto directamente
                    renderModalReto(retoData, false)
                }
            })
        }, 1200)
    } catch (err) {
        console.error("error in iniciarReto:", err)
        gsap.to(portal, { opacity: 0, duration: 0.3, onComplete: () => { portal.style.display = 'none' } })
    }
}

function renderModalReto(retoData, hidden = false) {
    const modal = document.getElementById('challenge-modal')
    if (!modal) {
        console.error('[Game] Challenge modal not found!')
        return
    }
    modal.style.zIndex = '10001'
    
    const title = document.getElementById('challenge-type')
    const question = document.getElementById('challenge-question')
    const optsContainer = document.getElementById('challenge-options-container')
    const feedback = document.getElementById('challenge-feedback')

    title.innerText = `RETO: ${(retoData.tipo_reto || 'Desafío').toUpperCase()}`
    question.innerText = retoData.pregunta
    feedback.style.display = 'none'
    optsContainer.innerHTML = ''

    const isMundo2 = appState.mundoActual === 2 || appState.mundoActual === 0
    
    if (!hidden) {
        modal.style.display = 'flex'
        modal.style.opacity = '1'
        
        // Apply Mundo 2 theme if applicable
        if (isMundo2) {
            modal.style.setProperty('--neon-pink', '#FFD700')
            modal.style.setProperty('--neon-blue', '#8A2BE2')
        }
        
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    } else {
        // For hidden mode (after lupa), ensure modal is ready
        modal.style.display = 'flex'
        modal.style.opacity = '1'
    }


    // Render options (Manejando opciones como JSON objeto/diccionario o array)
    const opcionesRaw = retoData.opciones || {}
    let opciones = {}

    // Detectar formato: si es array, convertir a objeto
    if (Array.isArray(opcionesRaw)) {
        opcionesRaw.forEach((opt, index) => {
            const key = String.fromCharCode(97 + index) // a, b, c, d...
            opciones[key] = opt
        })
    } else {
        opciones = opcionesRaw
    }

    // Validar que haya opciones
    const optKeys = Object.keys(opciones)
    if (optKeys.length === 0) {
        console.warn('[Game] No hay opciones definidas para este reto')
        feedback.style.display = 'block'
        feedback.innerText = 'Error: Este reto no tiene opciones configuradas.'
        return
    }

    Object.entries(opciones).forEach(([optKey, optValue]) => {
        const btn = document.createElement('button')
        btn.className = 'challenge-btn'
        btn.dataset.option = optKey
        btn.innerText = optValue

        btn.addEventListener('click', () => {
            // Disable all buttons to prevent double click
            document.querySelectorAll('.challenge-btn').forEach(b => b.style.pointerEvents = 'none')

            const respuestaCorrecta = String(retoData.respuesta_correcta).toLowerCase().trim()
            const respuestaUsuario = String(optKey).toLowerCase().trim()

            if (respuestaUsuario === respuestaCorrecta) {
                // Correct Answer
                btn.classList.add('correct')
                feedback.style.display = 'block'
                feedback.style.color = 'var(--neon-blue)'
                feedback.innerText = retoData.explicacion || '¡RESPUESTA CORRECTA! DESBLOQUEANDO...'

                // Animación de cosecha según el tipo de operación (Grado 3)
                if (appState.gradoActual === 3 && retoData.tipo_reto) {
                    playHarvestAnimation(retoData.tipo_reto)
                } else {
                    // Fallback: confeti normal para Grado 4
                    createConfetti({ count: 20, duration: 1500 })
                }

                // Incrementar racha
                appState.rachaCorrectas++
                console.log(`[Racha] Correctas seguidas: ${appState.rachaCorrectas}`)
                
                // Actualizar indicador visual de racha
                actualizarIndicadorRacha()
                
                // Verificar si llegó a 3 respuestas correctas seguidas
                if (appState.rachaCorrectas === 3) {
                    feedback.innerText = '🔥 ¡Racha de 3! ¡Bonus especial!'
                    createConfetti({ count: 30, duration: 2000 })
                    
                    // Mostrar bonus después de un momento
                    setTimeout(() => {
                        showBonus(async (bonusPoints) => {
                            if (bonusPoints > 0) {
                                appState.puntosTotales = (appState.puntosTotales || 0) + bonusPoints
                                updateHUD()
                                
                                // Guardar puntos bonus en la base de datos
                                try {
                                    await actualizarProgreso(appState.puntosTotales, appState.nivelActual)
                                    console.log(`[Racha Bonus] Guardados ${bonusPoints} puntos. Total: ${appState.puntosTotales}`)
                                } catch (err) {
                                    console.error('[Racha Bonus] Error al guardar puntos:', err)
                                }
                                
                                if (typeof showToast === 'function') {
                                    showToast(`🎁 ¡+${bonusPoints} puntos bonus por racha!`, 'success')
                                }
                            }
                        })
                    }, 2000)
                    
                    // Reset racha después de mostrar bonus
                    appState.rachaCorrectas = 0
                }

                // Mía interactúa
                reproducirVoz('acierto')
                miaLaugh()

                // Lanzar explicación pedagógica
                lanzarFeedbackPedagogico(retoData.nivel_id)

                // Reward
                const reward = retoData.puntos_recompensa || 100
                setTimeout(() => completarReto(reward, retoData.nivel_id), 4000)
            } else {
                // Wrong Answer - Reset racha
                appState.rachaCorrectas = 0
                console.log(`[Racha] Reiniciada a 0`)
                actualizarIndicadorRacha()
                
                btn.classList.add('wrong')
                feedback.style.display = 'block'
                feedback.style.color = 'red'
                feedback.innerText = 'ERROR EN EL SISTEMA. INTÉNTALO DE NUEVO.'

                // Mía interactúa
                reproducirVoz('error')
                miaThink()

                setTimeout(() => {
                    btn.classList.remove('wrong')
                    document.querySelectorAll('.challenge-btn').forEach(b => b.style.pointerEvents = 'auto')
                }, 2000)
            }
        })
        optsContainer.appendChild(btn)
    })

    if (!hidden) {
        modal.style.display = 'flex'
        gsap.to(modal, { opacity: 1, duration: 0.4, scale: 1 })
    }
}


async function completarReto(puntos, nivelCompletado) {
    const modal = document.getElementById('challenge-modal')

    // ✅ Actualizar estado local INMEDIATAMENTE (no esperar DB para el desbloqueo visual)
    const puntosActuales = parseInt(appState.puntosTotales) || 0
    const nuevosPuntos = puntosActuales + puntos
    const nivelActual = appState.nivelActual || 1
    const nuevoNivel = nivelActual <= nivelCompletado ? nivelCompletado + 1 : nivelActual

    console.log(`[CompletarReto] puntosActuales: ${puntosActuales} + ${puntos} = ${nuevosPuntos}`)
    console.log(`[CompletarReto] nivelActual: ${nivelActual} -> nuevoNivel: ${nuevoNivel}`)

    appState.puntosTotales = nuevosPuntos
    appState.nivelActual = nuevoNivel
    updateHUD()
    
    // 🎭 Cambiar avatar a versión dorada en nivel 20 (solo para Grado 4)
    if (nuevoNivel >= 20 && appState.gradoActual === 4) {
        activateGoldAvatar()
    }

    console.log(`[Progreso] Nivel completado: ${nivelCompletado} → Nuevo nivel: ${nuevoNivel} | XP: ${nuevosPuntos}`)

    // Determinar qué mundo está activo para renderizar correctamente
    let mundoActivo = appState.mundoActual
    if (mundoActivo === 0) {
        // Determinar mundo según el nivel completado
        if (nivelCompletado <= 10) mundoActivo = 1
        else if (nivelCompletado <= 15) mundoActivo = 2
        else mundoActivo = 3
    }

    // ✅ Cerrar el modal
    if (modal) {
        gsap.to(modal, {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            onComplete: () => {
                modal.style.display = 'none'
                gsap.set(modal, { scale: 1 })

                // 🔄 Desbloqueos de Mundos
                if (nivelCompletado === 10 && nuevoNivel === 11) {
                    // Mundo 1 completado → Desbloquear Mundo 2
                    triggerWorld1Completion()
                } else if (nivelCompletado === 15 && nuevoNivel === 16) {
                    // Mundo 2 completado → Desbloquear Mundo 3 + Celebración
                    triggerWorld2Completion()
                    const world3Card = document.getElementById('world-3-card')
                    if (world3Card) {
                        world3Card.classList.remove('world-locked')
                        world3Card.classList.add('neon-glow-gold')
                        document.getElementById('world-3-status').innerText = 'TEMPLO DISPONIBLE'
                    }
                    renderLevels(mundoActivo)
                } else if (nivelCompletado === 20) {
                    // Juego completado - Solo para Grado 4
                    if (appState.gradoActual === 4) {
                        activateGoldAvatar()
                        showCelebrationVideo()
                        reproducirVoz('mundo_3_completado')
                        triggerWorld2Completion()
                    }
                    // Para Grado 3 (La Granja), mostrar celebración de granja
                    renderLevels(mundoActivo)
                } else {
                    renderLevels(mundoActivo)
                }
            }
        })
    } else {
        renderLevels(mundoActivo)
    }

    // 💾 DB Update - Sincronizar con Supabase
    try {
        const result = await actualizarProgreso(nuevosPuntos, nuevoNivel)
        if (result.success) {
            console.log('[DB] Progreso guardado exitosamente')
        } else {
            console.warn('[DB] Error al guardar progreso:', result.error)
        }
    } catch (err) {
        console.error('[DB] Error de conexión:', err)
    }
}

// ==========================================
// AVATAR DORADO & VIDEO FIESTA - MUNDO 3
// ==========================================

function activateGoldAvatar() {
    const avatar = document.getElementById('mia-star-main')
    if (avatar) {
        avatar.src = './assets/mia/mia_avatar_gold.png'
        avatar.classList.add('avatar-gold-special', 'avatar-gold-special-glow')
        console.log('🎭 Avatar dorado activado - Nivel 20 alcanzado!')
    }
}

function showCelebrationVideo() {
    let videoOverlay = document.getElementById('celebration-video-overlay')
    
    if (!videoOverlay) {
        videoOverlay = document.createElement('div')
        videoOverlay.id = 'celebration-video-overlay'
        videoOverlay.innerHTML = `
            <video id="celebration-video" autoplay loop muted playsinline>
                <source src="./assets/video/mia_video.mp4" type="video/mp4">
            </video>
            <button id="btn-close-celebration" class="btn-close-video">✖</button>
        `
        document.body.appendChild(videoOverlay)
        
        document.getElementById('btn-close-celebration').addEventListener('click', () => {
            gsap.to(videoOverlay, { opacity: 0, duration: 0.5, onComplete: () => {
                videoOverlay.style.display = 'none'
                const video = document.getElementById('celebration-video')
                if (video) video.pause()
            }})
        })
    }
    
    videoOverlay.style.display = 'flex'
    gsap.fromTo(videoOverlay, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.5 }
    )
    
    const video = document.getElementById('celebration-video')
    if (video) {
        video.play()
    }
}

// ==========================================
// SELECTOR DE USUARIOS
// ==========================================

function mostrarSelectorUsuarios(perfiles, onSelectCallback) {
    const modal = document.getElementById('user-select-modal')
    const userList = document.getElementById('user-list')
    const splashStatus = document.getElementById('splash-status')
    const globalMia = document.getElementById('global-mia-sidebar')
    
    if (!modal || !userList) {
        console.error("Modal de usuario no encontrado")
        return
    }
    
    console.log("Mostrando selector de usuarios, perfiles:", perfiles)
    
    // OCULTAR SIDEBAR DE MÍA EN MODAL DE USUARIO
    if (globalMia) {
        globalMia.style.display = 'none'
    }
    
    // Limpiar lista anterior
    userList.innerHTML = ''
    
    // Crear tarjeta para cada usuario con el nuevo diseño
    perfiles.forEach((perfil) => {
        const card = document.createElement('div')
        card.innerHTML = `
            <div class="user-avatar">👤</div>
            <div class="user-info">
                <h3 class="neon-text">${perfil.nombre}</h3>
                <p>Nivel ${perfil.nivel_actual}</p>
                <div class="user-stats">
                    <span>⭐ ${perfil.puntos_totales} pts</span>
                </div>
            </div>
        `
        
        addTouchFeedback(card, { haptic: 'light' })
        
        card.onclick = function() {
            console.log("Usuario seleccionado:", perfil.nombre)
            appState.nombre = perfil.nombre
            appState.nivelActual = parseInt(perfil.nivel_actual) || 1
            appState.puntosTotales = perfil.puntos_totales || "0000"
            setCachedProfile(perfil)
            
            splashStatus.innerText = `Bienvenido, ${perfil.nombre}!`
            
            // Ocultar modal y MOSTRAR SIDEBAR DE MÍA
            modal.style.display = 'none'
            if (globalMia) {
                globalMia.style.display = 'flex'
                gsap.fromTo(globalMia, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.5 })
            }
            
            // Actualizar HUD
            updateHUD()
            
            // Llamar callback
            if (onSelectCallback) onSelectCallback()
        }
        
        userList.appendChild(card)
    })
    
    // Agregar opción de crear nuevo usuario
    const newCard = document.createElement('div')
    newCard.className = 'user-new-btn'
    newCard.innerHTML = `
        <div class="user-avatar">➕</div>
        <div class="user-info">
            <h3 style="color: rgba(255,255,255,0.7);">Nuevo Jugador</h3>
            <p>Crear una nueva cuenta</p>
        </div>
    `
    
    addTouchFeedback(newCard, { haptic: 'light' })
    
    newCard.onclick = async function() {
        const nombre = prompt("Ingresa el nombre del nuevo jugador:")
        if (nombre && nombre.trim()) {
            splashStatus.innerText = "Creando perfil..."
            const { data, error } = await supabase
                .from('perfil_jugador')
                .insert([{ nombre: nombre.trim(), nivel_actual: 1, puntos_totales: '0' }])
                .select()
                .single()
            
            if (data && !error) {
                appState.nombre = data.nombre
                appState.nivelActual = 1
                appState.puntosTotales = "0000"
                setCachedProfile(data)
                
                splashStatus.innerText = `Bienvenido, ${data.nombre}!`
                modal.style.display = 'none'
                
                // MOSTRAR SIDEBAR DE MÍA
                if (globalMia) {
                    globalMia.style.display = 'flex'
                    gsap.fromTo(globalMia, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.5 })
                }
                
                updateHUD()
                
                if (onSelectCallback) onSelectCallback()
            }
        }
    }
    
    userList.appendChild(newCard)
    
    // Mostrar modal con animación
    modal.style.display = 'flex'
    gsap.fromTo(modal, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' })
}

// ==========================================
// RULETA DE PUNTOS - BONUS MUNDOS
// ==========================================

const ROULETTE_PRIZES = [
    { value: 50, label: '+50', degrees: 0 },
    { value: 100, label: '+100', degrees: 45 },
    { value: 150, label: '+150', degrees: 90 },
    { value: 200, label: 'x2', degrees: 135 },
    { value: 200, label: '+200', degrees: 180 },
    { value: 50, label: '+50', degrees: 225 },
    { value: 75, label: '+75', degrees: 270 },
    { value: 500, label: '¡+500!', degrees: 315 }
]

let rouletteSpinning = false
let pendingBonusPoints = 0

function showRoulette(bonusCallback) {
    const overlay = document.getElementById('roulette-overlay')
    const wheel = document.getElementById('roulette-wheel')
    const spinBtn = document.getElementById('btn-spin-roulette')
    const resultDiv = document.getElementById('roulette-result')
    const prizeSpan = document.getElementById('roulette-prize')
    
    overlay.classList.add('active')
    resultDiv.style.display = 'none'
    spinBtn.style.display = 'inline-block'
    spinBtn.disabled = false
    wheel.style.transition = 'none'
    wheel.style.transform = 'rotate(0deg)'
    
    spinBtn.onclick = () => {
        if (rouletteSpinning) return
        rouletteSpinning = true
        spinBtn.disabled = true
        
        const randomIndex = Math.floor(Math.random() * ROULETTE_PRIZES.length)
        const prize = ROULETTE_PRIZES[randomIndex]
        const extraSpins = 5 + Math.floor(Math.random() * 3)
        const totalDegrees = (extraSpins * 360) + (360 - prize.degrees)
        
        wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
        wheel.style.transform = `rotate(${totalDegrees}deg)`
        
        setTimeout(() => {
            prizeSpan.textContent = prize.label
            resultDiv.style.display = 'block'
            spinBtn.style.display = 'none'
            
            pendingBonusPoints = prize.value
            
            createConfetti({ count: 50, duration: 3000 })
            triggerHaptic('success')
            rouletteSpinning = false
        }, 4000)
    }
    
    document.getElementById('btn-claim-roulette').onclick = async () => {
        overlay.classList.remove('active')
        
        // Guardar puntos bonus en la base de datos
        if (pendingBonusPoints > 0) {
            try {
                const puntosActuales = parseInt(appState.puntosTotales) || 0
                await actualizarProgreso(puntosActuales, appState.nivelActual)
                console.log(`[Bonus] Guardados ${pendingBonusPoints} puntos bonus. Total: ${puntosActuales}`)
            } catch (err) {
                console.error('[Bonus] Error al guardar puntos:', err)
            }
        }
        
        if (bonusCallback) bonusCallback(pendingBonusPoints)
    }
}

// ==========================================
// DESAFÍO RÁPIDO - MINI JUEGO
// ==========================================

const QUICK_QUESTIONS = [
    {
        nivel: 1,
        pregunta: '5 + 3 = ?',
        opciones: { a: '6', b: '7', c: '8', d: '9' },
        respuesta: 'c'
    },
    {
        nivel: 2,
        pregunta: '10 - 4 = ?',
        opciones: { a: '5', b: '6', c: '7', d: '4' },
        respuesta: 'b'
    },
    {
        nivel: 3,
        pregunta: '4 × 2 = ?',
        opciones: { a: '6', b: '8', c: '10', d: '12' },
        respuesta: 'b'
    },
    {
        nivel: 4,
        pregunta: '15 + 7 = ?',
        opciones: { a: '20', b: '21', c: '22', d: '23' },
        respuesta: 'c'
    },
    {
        nivel: 5,
        pregunta: '9 - 3 = ?',
        opciones: { a: '5', b: '6', c: '7', d: '4' },
        respuesta: 'b'
    },
    {
        nivel: 6,
        pregunta: '6 × 4 = ?',
        opciones: { a: '20', b: '24', c: '28', d: '22' },
        respuesta: 'b'
    },
    {
        nivel: 7,
        pregunta: '20 - 8 = ?',
        opciones: { a: '10', b: '11', c: '12', d: '13' },
        respuesta: 'c'
    },
    {
        nivel: 8,
        pregunta: '3 × 7 = ?',
        opciones: { a: '18', b: '21', c: '24', d: '20' },
        respuesta: 'b'
    },
    {
        nivel: 9,
        pregunta: '25 + 15 = ?',
        opciones: { a: '38', b: '40', c: '42', d: '39' },
        respuesta: 'b'
    },
    {
        nivel: 10,
        pregunta: '16 ÷ 4 = ?',
        opciones: { a: '3', b: '5', c: '4', d: '6' },
        respuesta: 'c'
    }
]

let quickState = {
    currentQuestion: 0,
    correct: 0,
    points: 0,
    timerInterval: null,
    bonusCallback: null
}

function showQuickChallenge(bonusCallback) {
    const overlay = document.getElementById('quick-challenge-overlay')
    const questionText = document.getElementById('quick-text')
    const optionsContainer = document.getElementById('quick-options')
    const timerBar = document.getElementById('quick-timer-bar')
    const currentSpan = document.getElementById('quick-current')
    const correctSpan = document.getElementById('quick-correct')
    const pointsSpan = document.getElementById('quick-points')
    const resultDiv = document.getElementById('quick-result')
    const resultText = document.getElementById('quick-result-text')
    const resultPoints = document.getElementById('quick-result-points')
    const resultIcon = document.getElementById('quick-result-icon')
    
    quickState = {
        currentQuestion: 0,
        correct: 0,
        points: 0,
        timerInterval: null,
        bonusCallback: bonusCallback
    }
    
    overlay.classList.add('active')
    resultDiv.style.display = 'none'
    document.querySelector('.quick-question').style.display = 'block'
    document.querySelector('.quick-options').style.display = 'grid'
    document.querySelector('.quick-timer').style.display = 'block'
    document.querySelector('.quick-score').style.display = 'flex'
    
    const shuffled = [...QUICK_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 3)
    quickState.questions = shuffled
    
    loadQuestion()
    
    function loadQuestion() {
        const q = quickState.questions[quickState.currentQuestion]
        currentSpan.textContent = quickState.currentQuestion + 1
        correctSpan.textContent = quickState.correct
        pointsSpan.textContent = quickState.points
        questionText.textContent = q.pregunta
        
        const options = optionsContainer.querySelectorAll('.quick-option')
        const letters = ['a', 'b', 'c', 'd']
        options.forEach((btn, i) => {
            btn.textContent = q.opciones[letters[i]]
            btn.dataset.answer = letters[i]
            btn.className = 'quick-option'
            btn.disabled = false
        })
        
        timerBar.style.width = '100%'
        startTimer()
    }
    
    function startTimer() {
        if (quickState.timerInterval) clearInterval(quickState.timerInterval)
        
        let timeLeft = 100
        quickState.timerInterval = setInterval(() => {
            timeLeft -= 2
            timerBar.style.width = timeLeft + '%'
            
            if (timeLeft <= 30) {
                timerBar.style.background = 'linear-gradient(90deg, #FF3232, #FF6B6B)'
            } else if (timeLeft <= 60) {
                timerBar.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)'
            }
            
            if (timeLeft <= 0) {
                clearInterval(quickState.timerInterval)
                timeOut()
            }
        }, 100)
    }
    
    function timeOut() {
        const options = optionsContainer.querySelectorAll('.quick-option')
        options.forEach(btn => btn.disabled = true)
        
        const correctAnswer = quickState.questions[quickState.currentQuestion].respuesta
        options.forEach(btn => {
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct')
            }
        })
        
        setTimeout(() => nextQuestion(), 1000)
    }
    
    function checkAnswer(selected) {
        if (quickState.timerInterval) clearInterval(quickState.timerInterval)
        
        const q = quickState.questions[quickState.currentQuestion]
        const options = optionsContainer.querySelectorAll('.quick-option')
        options.forEach(btn => btn.disabled = true)
        
        if (selected === q.respuesta) {
            quickState.correct++
            quickState.points += 50
            options.forEach(btn => {
                if (btn.dataset.answer === selected) {
                    btn.classList.add('correct')
                }
            })
            triggerHaptic('success')
        } else {
            options.forEach(btn => {
                if (btn.dataset.answer === selected) {
                    btn.classList.add('wrong')
                }
                if (btn.dataset.answer === q.respuesta) {
                    btn.classList.add('correct')
                }
            })
            triggerHaptic('error')
        }
        
        correctSpan.textContent = quickState.correct
        pointsSpan.textContent = quickState.points
        
        setTimeout(() => nextQuestion(), 1000)
    }
    
    function nextQuestion() {
        quickState.currentQuestion++
        
        if (quickState.currentQuestion >= 3) {
            showResults()
        } else {
            loadQuestion()
        }
    }
    
    function showResults() {
        document.querySelector('.quick-question').style.display = 'none'
        document.querySelector('.quick-options').style.display = 'none'
        document.querySelector('.quick-timer').style.display = 'none'
        document.querySelector('.quick-score').style.display = 'none'
        
        resultDiv.style.display = 'block'
        
        if (quickState.correct === 3) {
            resultIcon.textContent = '🏆'
            resultText.textContent = '¡PERFECTO! ¡3 de 3!'
            resultPoints.textContent = `+${quickState.points + 100} puntos`
            quickState.points += 100
            createConfetti({ count: 80, duration: 4000 })
        } else if (quickState.correct >= 2) {
            resultIcon.textContent = '🎉'
            resultText.textContent = `¡Muy bien! ${quickState.correct}/3`
            resultPoints.textContent = `+${quickState.points} puntos`
            createConfetti({ count: 40, duration: 2000 })
        } else {
            resultIcon.textContent = '💪'
            resultText.textContent = `¡Sigue practicando! ${quickState.correct}/3`
            resultPoints.textContent = `+${quickState.points} puntos`
        }
    }
    
    optionsContainer.querySelectorAll('.quick-option').forEach(btn => {
        btn.onclick = () => checkAnswer(btn.dataset.answer)
    })
    
    document.getElementById('btn-claim-quick').onclick = async () => {
        overlay.classList.remove('active')
        
        // Guardar puntos bonus en la base de datos
        if (quickState.points > 0) {
            try {
                const puntosActuales = parseInt(appState.puntosTotales) || 0
                await actualizarProgreso(puntosActuales, appState.nivelActual)
                console.log(`[Bonus] Guardados ${quickState.points} puntos del desafío rápido. Total: ${puntosActuales}`)
            } catch (err) {
                console.error('[Bonus] Error al guardar puntos:', err)
            }
        }
        
        if (quickState.bonusCallback) {
            quickState.bonusCallback(quickState.points)
        }
    }
}

// ==========================================
// FUNCIÓN PRINCIPAL PARA MOSTRAR BONUS
// ==========================================

function showBonus(bonusCallback) {
    const choice = Math.random() > 0.5 ? 'roulette' : 'quick'
    
    if (choice === 'roulette') {
        showRoulette(bonusCallback)
    } else {
        showQuickChallenge(bonusCallback)
    }
}

