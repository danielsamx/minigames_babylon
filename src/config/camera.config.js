/**
 * Configuración centralizada de las cámaras de Babylon.js para cada mini-proyecto.
 */
export const CAMERA_CONFIG = {
    // ArcRotateCamera: Órbita del Sistema Solar
    arcRotate: {
        alpha: 3.14 / 4,               // Ángulo de rotación horizontal inicial (en radianes)
        beta: 3.14 / 3,                // Ángulo de rotación vertical inicial (en radianes)
        radius: 35,                    // Distancia inicial desde el objetivo
        target: { x: 0, y: 0, z: 0 },  // Punto de enfoque inicial
        lowerRadiusLimit: 8,           // Distancia mínima de acercamiento
        upperRadiusLimit: 80,          // Distancia máxima de alejamiento
        lowerBetaLimit: 0.1,           // Límite vertical superior (evita que se voltee la cámara)
        upperBetaLimit: 3.14 / 2 - 0.05, // Límite vertical inferior (no pasar debajo del plano de órbita)
        wheelPrecision: 50,            // Sensibilidad de la rueda de desplazamiento (mayor = más lento)
        panningSensibility: 1000,      // Sensibilidad del desplazamiento lateral (pan)
        inertia: 0.9                   // Inercia de frenado (suavidad)
    },

    // FreeCamera: Exploración en primera persona del Museo
    free: {
        position: { x: 0, y: 1.8, z: -15 }, // Posición inicial (altura promedio de ojos = 1.8m)
        speed: 0.3,                    // Velocidad de movimiento por frame
        angularSensibility: 2000,      // Sensibilidad del mouse/giro (mayor = más lento)
        inertia: 0.85,                 // Suavidad del movimiento
        checkCollisions: true,         // Activar colisiones para chocar con paredes/esculturas
        applyGravity: true,            // Activar gravedad física para no flotar
        ellipsoid: { x: 0.8, y: 1.0, z: 0.8 }, // Tamaño físico aproximado de la cámara (cuerpo del jugador)
        keysUp: [38, 87],             // Teclas W y Flecha arriba
        keysDown: [40, 83],           // Teclas S y Flecha abajo
        keysLeft: [37, 65],           // Teclas A y Flecha izquierda
        keysRight: [39, 68]           // Teclas D y Flecha derecha
    },

    // FollowCamera: Seguimiento suave de la Nave Espacial
    follow: {
        radius: 12,                    // Distancia detrás del objetivo (en metros)
        heightOffset: 4,               // Altura sobre el objetivo (en metros)
        rotationOffset: 180,           // Ángulo de rotación relativo al objetivo (180 = ver desde atrás)
        cameraAcceleration: 0.03,      // Aceleración de la cámara para alcanzar el objetivo (suavizado)
        maxCameraSpeed: 10,            // Velocidad máxima permitida para la cámara
        checkCollisions: false         // Evita vibraciones al atravesar anillos
    },

    // AnaglyphCamera (ArcRotate o Free adaptable)
    anaglyph: {
        eyeSpace: 0.06,                // Distancia entre ojos para el efecto estereoscópico 3D (IPD promedio = 6cm)
        alpha: -3.14 / 3,
        beta: 3.14 / 3,
        radius: 15,
        target: { x: 0, y: 0, z: 0 },
        lowerRadiusLimit: 5,
        upperRadiusLimit: 40
    },

    // DeviceOrientationCamera: Tiro al Blanco Cósmico
    deviceOrientation: {
        position: { x: 0, y: 0, z: 0 },
        angularSensibility: 10000,     // Sensibilidad de giro en móviles
        moveSensibility: 50,
        desktopSpeed: 0.05,            // Velocidad de arrastre de ratón (simulado en PC)
        fov: 1.0                       // Field Of View (en radianes)
    }
};
