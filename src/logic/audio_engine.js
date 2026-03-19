
/**
 * Audio Engine - El Mundo de Mía
 * Handles asset loading, verification and fallback systems.
 */

class AudioEngine {
    constructor() {
        this.fallbackBeep = 'https://actions.google.com/sounds/v1/science_fiction/beep_low_pulse.ogg'; // Temporary Beep Neón
        this.baseVoPath = '/assets/audio/vo/';
    }

    /**
     * Verifies if an audio asset exists before playing.
     * @param {string} fileName 
     * @returns {Promise<boolean>}
     */
    async checkAssetExists(fileName) {
        try {
            const response = await fetch(`${this.baseVoPath}${fileName}`, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error(`[AudioEngine] Error checking asset ${fileName}:`, error);
            return false;
        }
    }

    /**
     * Prepare a URL for a level voice based on world and level ID.
     * @param {number} world 
     * @param {number} level 
     * @returns {string}
     */
    getVoUrl(world, level) {
        return `${this.baseVoPath}mia_v${world}_n${level}.mp3`;
    }

    /**
     * Resolves the final audio source, using fallback if needed.
     * @param {string} targetUrl 
     */
    async resolveSource(targetUrl) {
        const fileName = targetUrl.split('/').pop();
        const exists = await this.checkAssetExists(fileName);

        if (!exists) {
            console.warn(`%c[AudioEngine] MISSING ASSET: ${fileName}. Using Neon Beep fallback.`, 'color: #FF00FF; font-weight: bold;');
            return this.fallbackBeep;
        }

        return targetUrl;
    }
}

export const audioEngine = new AudioEngine();
