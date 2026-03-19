/**
 * EL MUNDO DE MÍA - PHASE 1 ENGAGEMENT SYSTEM
 * Pollito de Cristal & Modo Super-Cian
 */
import { gsap } from 'gsap';

export const engagementSystem = {
    pollito: null,
    isSuperCian: false,

    init() {
        this.createPollito();
        console.log('[Engagement] System Initialized');
    },

    /**
     * Pollito de Cristal - Crystalline mascot
     */
    createPollito() {
        const pollito = document.createElement('div');
        pollito.id = 'pollito-cristal';
        pollito.innerHTML = '🐤';
        pollito.style.cssText = `
            position: fixed;
            font-size: 2.5rem;
            z-index: 9000;
            pointer-events: none;
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.8));
            display: none;
        `;
        document.body.appendChild(pollito);
        this.pollito = pollito;

        // Floating animation
        gsap.to(pollito, {
            y: -15,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    },

    togglePollito(visible) {
        if (!this.pollito) return;
        this.pollito.style.display = visible ? 'block' : 'none';
        if (visible) {
            this.updatePollitoPosition();
        }
    },

    updatePollitoPosition() {
        const mia = document.getElementById('mia-star-main');
        if (!mia || !this.pollito) return;

        const rect = mia.getBoundingClientRect();
        gsap.to(this.pollito, {
            left: rect.left - 40,
            top: rect.top + 20,
            duration: 1,
            ease: 'power2.out'
        });
    },

    /**
     * Modo Super-Cian - High-energy visual state
     */
    activateSuperCian() {
        if (this.isSuperCian) return;
        this.isSuperCian = true;
        
        const mia = document.getElementById('mia-star-main');
        const body = document.body;

        body.classList.add('super-cian-mode');
        
        if (mia) {
            mia.classList.add('glow-super-cian');
            gsap.to(mia, {
                filter: 'drop-shadow(0 0 30px #00FFFF) brightness(1.5)',
                scale: 1.15,
                duration: 0.5
            });

            // Sparkles
            this.createSuperCianSparkles();
        }

        console.log('[Engagement] Modo Super-Cian ACTIVATED');
    },

    createSuperCianSparkles() {
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'super-cian-sparkle';
            sparkle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #00FFFF;
                border-radius: 50%;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(sparkle);

            const mia = document.getElementById('mia-star-main').getBoundingClientRect();
            
            gsap.set(sparkle, { 
                x: mia.left + mia.width/2, 
                y: mia.top + mia.height/2 
            });

            gsap.to(sparkle, {
                x: (Math.random() - 0.5) * 400 + (mia.left + mia.width/2),
                y: (Math.random() - 0.5) * 400 + (mia.top + mia.height/2),
                opacity: 0,
                scale: 0,
                duration: 1 + Math.random(),
                onComplete: () => sparkle.remove()
            });
        }
    }
};
