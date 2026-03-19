/**
 * EL MUNDO DE MÍA - FASE 1 GAME ENGINE
 * Lógica de niveles, gestión de mundos y gating de grados.
 */
import { supabase, actualizarProgreso } from '../supabase.js';
import { engagementSystem } from './engagement.js';

export const gameEngine = {
    appState: {
        nivelActual: 1,
        puntosTotales: 0,
        nombre: "MÍA",
        mundoActual: 1,
        gradoActual: 3,
        rachaCorrectas: 0,
        tablaDesbloqueada: null
    },

    init(state) {
        this.appState = { ...this.appState, ...state };
        this.checkGradeGating();
        console.log('[Game Engine] Initialized');
    },

    /**
     * Gating de Grados: Candado de Cristal
     * Bloquea 4to grado hasta completar Nivel 20 de la Granja (Grado 3).
     */
    checkGradeGating() {
        const grade4Btn = document.getElementById('grade-4-btn');
        if (!grade4Btn) return;

        const nivelSuficiente = this.appState.nivelActual >= 20;

        if (!nivelSuficiente) {
            grade4Btn.classList.add('locked', 'crystal-lock');
            grade4Btn.innerHTML = `
                <div class="grade-icon">🔒</div>
                <div class="grade-name">GRADO 4 (BLOQUEADO)</div>
                <div class="crystal-lock-info">Completa el Nivel 20 de la Granja</div>
            `;
            console.log('[Gating] Grado 4 bloqueado por Candado de Cristal');
        } else {
            grade4Btn.classList.remove('locked', 'crystal-lock');
            grade4Btn.innerHTML = `
                <div class="grade-icon">⚡</div>
                <div class="grade-name">GRADO 4 - EL MUNDO DE MÍA</div>
            `;
            console.log('[Gating] Grado 4 DESBLOQUEADO');
        }
    },

    /**
     * Sistema de Bonos: Biblioteca de Cristal
     * Configurada para que se abra al ganar las Tablas de Sabiduría.
     */
    verificarBonoBiblioteca(nivelCompletado) {
        const tablas = {
            3: { 
                SUMA: { nombre: 'Tabla de Sumar', nivel: 5 },
                RESTA: { nombre: 'Tabla de Restar', nivel: 10 },
                MULTIPLICACION: { nombre: 'Tabla de Multiplicar', nivel: 15 },
                DIVISION: { nombre: 'Tabla de Dividir', nivel: 20 }
            }
        };

        const gradoTablas = tablas[this.appState.gradoActual];
        if (!gradoTablas) return;

        for (const [key, t] of Object.entries(gradoTablas)) {
            if (nivelCompletado === t.nivel) {
                this.aperturaBibliotecaCristal(key, t.nombre);
                return;
            }
        }
    },

    aperturaBibliotecaCristal(key, nombre) {
        console.log(`[Biblioteca] ¡ABIERTA! Desbloqueada: ${nombre}`);
        // Animaciones GSAP de apertura
        const libraryOverlay = document.getElementById('library-overlay');
        if (libraryOverlay) {
            libraryOverlay.classList.add('active');
            this.playGlassTransition();
        }
    },

    playGlassTransition() {
        // Visual effect for opening library
        const transition = document.createElement('div');
        transition.className = 'glass-transition-overlay';
        document.body.appendChild(transition);
        
        gsap.to(transition, {
            opacity: 1,
            backdropFilter: 'blur(15px)',
            duration: 0.8,
            onComplete: () => {
                setTimeout(() => transition.remove(), 1000);
            }
        });
    },

    /**
     * Feedback Visual: Animaciones de Cosecha (GSAP)
     * Vinculadas a los aciertos (lógica central de puntos).
     */
    triggerSuccessFeedback(operationType) {
        console.log(`[Feedback] Cosecha de ${operationType} activada`);
        
        // Esta función llama a las animaciones de main.js/style.css
        // En un despliegue final, estas animaciones se centralizan aquí.
        if (typeof window.playHarvestAnimation === 'function') {
            window.playHarvestAnimation(operationType);
        }

        // Activación de Super-Cian si la racha es alta
        this.appState.rachaCorrectas++;
        if (this.appState.rachaCorrectas >= 3) {
            engagementSystem.activateSuperCian();
        }
    }
};
