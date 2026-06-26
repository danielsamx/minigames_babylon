/**
 * Configuración de assets del taller (especialmente para la generación de texturas procedurales).
 */
export const ASSETS_CONFIG = {
    textures: {
        sun: {
            baseColor: '#f97316',
            glowColor: '#ef4444',
            noiseFreq: 6
        },
        mercury: {
            baseColor: '#78716c',
            craterColor: '#44403c',
            craters: 15
        },
        venus: {
            baseColor: '#eab308',
            cloudColor: '#ca8a04',
            bands: 8
        },
        earth: {
            baseColor: '#0284c7',
            landColor: '#16a34a',
            cloudColor: '#ffffff'
        },
        mars: {
            baseColor: '#dc2626',
            darkColor: '#991b1b',
            craters: 10
        },
        jupiter: {
            baseColor: '#ea580c',
            bandColor: '#b45309',
            spotColor: '#7f1d1d',
            bands: 12
        },
        museumFloor: {
            primary: '#1e293b',
            secondary: '#0f172a',
            gridSize: 256
        },
        stars: {
            density: 300,
            starColor: '#ffffff'
        }
    }
};
