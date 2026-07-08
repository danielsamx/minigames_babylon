/**
 * Configuración general de las escenas y sus elementos visuales.
 */
export const SCENE_CONFIG = {
    // ArcRotate - Sistema Solar
    arcRotate: {
        clearColor: { r: 0.02, g: 0.02, b: 0.05, a: 1.0 },   // Negro espacio profundo
        sunSize: 6,
        orbitSpeeds: {
            mercury: 0.03,
            venus:   0.02,
            earth:   0.015,
            mars:    0.01,
            jupiter: 0.005
        },
        orbitRadii: {
            mercury: 7,
            venus:   11,
            earth:   15,
            mars:    20,
            jupiter: 28
        },
        planetSizes: {
            mercury: 0.6,
            venus:   1.1,
            earth:   1.2,
            mars:    0.8,
            jupiter: 2.8
        },
        // Asteroides invasores
        invaderCount: 6,
        invaderRadius: { min: 30, max: 50 },
        invaderSpeed:  { min: 0.0008, max: 0.0025 }
    },

    // FreeCamera - Museo
    free: {
        clearColor: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },   // Blanco (#ffffff)
        gravity: { x: 0, y: -9.81, z: 0 },
        museumSize: { width: 30, depth: 30, height: 8 },
        wallColor:  { r: 0.85, g: 0.85, b: 0.85 },
        floorColor: { r: 0.1,  g: 0.1,  b: 0.12 },
        pedestals: [
            { x: -8, z: -5, type: 'torusKnot',    color: '#38bdf8', title: 'Nudo Toroidal 3D' },
            { x:  8, z: -5, type: 'crystal',       color: '#a78bfa', title: 'Cristal Crystalline' },
            { x: -8, z:  8, type: 'nestedSpheres', color: '#f43f5e', title: 'Esferas Concéntricas' },
            { x:  8, z:  8, type: 'cyberCube',     color: '#10b981', title: 'Cubo Holográfico' }
        ],
        // Guardias de seguridad
        guards: [
            { startX:  0,  startZ:  0,  patrol: [{ x:  5, z:  5 }, { x: -5, z: 5 }, { x: -5, z: -5 }, { x: 5, z: -5 }] },
            { startX:  10, startZ:  10, patrol: [{ x: 10, z: 10 }, { x: -10, z: 10 }, { x: -10, z: -10 }, { x: 10, z: -10 }] }
        ]
    },

    // FollowCamera - Carrera Espacial
    follow: {
        clearColor: { r: 0.01, g: 0.01, b: 0.04, a: 1.0 },   // Negro nebulosa
        tunnelRadius:  15,
        tunnelLength:  500,
        shipSpeed:     0.15,
        turnSpeed:     0.05,
        ringCount:     20,
        ringColor:     { r: 0.9, g: 0.5, b: 0.1 },
        // Asteroides obstáculo
        obstacleCount:  8,
        obstacleSpeed:  { min: 0.02, max: 0.06 }
    },

    // Anaglyph - Laberinto Neon
    anaglyph: {
        clearColor: { r: 0.0, g: 0.0, b: 0.02, a: 1.0 },   // Negro profundo
        gridSize:   20,
        mazeSize:   10,
        neonCyan:   { r: 0.0, g: 0.9, b: 1.0 },
        neonRed:    { r: 1.0, g: 0.1, b: 0.1 },
        // Perseguidor
        chaserSpeed:  3.5,
        chaserPenalty: 5     // segundos que resta al cronómetro
    },

    // DeviceOrientation - Tiro al Blanco
    deviceOrientation: {
        clearColor: { r: 0.01, g: 0.01, b: 0.03, a: 1.0 },   // Negro estelar
        targetCount:  15,
        spawnRadius:  22,
        targetSizes:  { min: 1.0, max: 2.5 },
        // Velocidad de acercamiento hacia el jugador
        approachSpeed: { min: 0.012, max: 0.035 },
        damageRadius:  6,     // increased radius for easier hit detection
        damagePenalty: 100
    }
};
