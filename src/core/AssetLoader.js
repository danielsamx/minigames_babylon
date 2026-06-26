/**
 * Cargador y generador de texturas procedurales dinámicas.
 * Evita la dependencia de archivos de imágenes externos y permite que la app funcione offline.
 */
import { ASSETS_CONFIG } from '../config/assets.config.js';

export class AssetLoader {
    /**
     * Crea una textura de cielo estrellado para el Skybox.
     * @param {BABYLON.Scene} scene
     * @returns {BABYLON.DynamicTexture}
     */
    static createStarsTexture(scene) {
        const size = 1024;
        const dynamicTexture = new BABYLON.DynamicTexture("starsTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        // Fondo del espacio profundo (azul muy oscuro/negro)
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, size, size);

        // Dibujar estrellas de colores pastel
        const density = ASSETS_CONFIG.textures.stars.density;
        const pastelColors = ["#fecdd3", "#bae6fd", "#fef08a", "#e9d5ff", "#fed7aa", "#ffffff"];
        
        for (let i = 0; i < density; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 0.5 + Math.random() * 1.5;
            const alpha = 0.4 + Math.random() * 0.6;

            ctx.fillStyle = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea la textura procedural del Sol.
     * @param {BABYLON.Scene} scene
     * @returns {BABYLON.DynamicTexture}
     */
    static createSunTexture(scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture("sunTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        const conf = ASSETS_CONFIG.textures.sun;

        // Degradado radial para simular plasma incandescente
        const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
        grad.addColorStop(0, '#ffffcc');
        grad.addColorStop(0.2, conf.baseColor);
        grad.addColorStop(0.8, conf.glowColor);
        grad.addColorStop(1, '#7c2d12');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Ruido/Flares solares simulados con arcos finos
        ctx.strokeStyle = '#fdba74';
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1 + Math.random() * 3;
            ctx.arc(size/2, size/2, 80 + Math.random() * 100, Math.random() * Math.PI, Math.random() * Math.PI * 2);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea texturas procedurales para los planetas basadas en config.
     * @param {string} planetKey
     * @param {BABYLON.Scene} scene
     * @returns {BABYLON.DynamicTexture}
     */
    static createPlanetTexture(planetKey, scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture(`${planetKey}Tex`, size, scene, true);
        const ctx = dynamicTexture.getContext();
        const conf = ASSETS_CONFIG.textures[planetKey];

        if (!conf) {
            // Textura por defecto si no existe configuración
            ctx.fillStyle = "#888888";
            ctx.fillRect(0, 0, size, size);
            dynamicTexture.update();
            return dynamicTexture;
        }

        ctx.fillStyle = conf.baseColor;
        ctx.fillRect(0, 0, size, size);

        // Generar detalles específicos del planeta
        if (planetKey === 'mercury' || planetKey === 'mars') {
            // Cráteres
            ctx.fillStyle = conf.craterColor || conf.darkColor;
            for (let i = 0; i < conf.craters; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 10 + Math.random() * 30;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                
                // Efecto de relieve 3D simple del cráter
                ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (planetKey === 'venus' || planetKey === 'jupiter') {
            // Bandas gaseosas atmosféricas
            for (let i = 0; i < conf.bands; i++) {
                ctx.fillStyle = i % 2 === 0 ? conf.cloudColor || conf.bandColor : conf.baseColor;
                const h = 20 + Math.random() * 40;
                const y = (size / conf.bands) * i;
                ctx.fillRect(0, y, size, h);
            }
            
            // Si es Júpiter, dibujar la Gran Mancha Roja
            if (planetKey === 'jupiter') {
                ctx.fillStyle = conf.spotColor;
                ctx.beginPath();
                ctx.ellipse(size * 0.6, size * 0.65, 45, 25, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (planetKey === 'earth') {
            // Tierra: Océanos base, dibujar continentes aleatorios y nubes
            ctx.fillStyle = conf.landColor;
            
            // Dibujar masas continentales procedurales (círculos unidos)
            for (let i = 0; i < 8; i++) {
                const cx = size * 0.2 + Math.random() * (size * 0.6);
                const cy = size * 0.2 + Math.random() * (size * 0.6);
                const r = 60 + Math.random() * 80;
                
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
                
                // Cuerpos de tierra secundarios
                for (let j = 0; j < 3; j++) {
                    ctx.beginPath();
                    ctx.arc(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 80, r * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Capa de Nubes
            ctx.fillStyle = conf.cloudColor;
            ctx.globalAlpha = 0.45;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                const y = Math.random() * size;
                ctx.ellipse(size / 2, y, size * 0.45, 15 + Math.random() * 20, 0.05, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea la textura para el suelo del museo.
     * @param {BABYLON.Scene} scene
     * @returns {BABYLON.DynamicTexture}
     */
    static createMuseumFloorTexture(scene) {
        const size = ASSETS_CONFIG.textures.museumFloor.gridSize;
        const dynamicTexture = new BABYLON.DynamicTexture("museumFloorTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        const conf = ASSETS_CONFIG.textures.museumFloor;

        // Dibujar un patrón de baldosas de mármol de alta gama
        ctx.fillStyle = conf.primary;
        ctx.fillRect(0, 0, size, size);

        // Bordes de la baldosa
        ctx.strokeStyle = conf.secondary;
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, size, size);

        // Vetas de mármol elegantes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * size, 0);
            ctx.bezierCurveTo(
                Math.random() * size, size * 0.3,
                Math.random() * size, size * 0.7,
                Math.random() * size, size
            );
            ctx.stroke();
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea una textura de cuadrícula de neón de alta calidad.
     * @param {string} colorHex - Color de las líneas
     * @param {BABYLON.Scene} scene
     * @returns {BABYLON.DynamicTexture}
     */
    static createNeonGridTexture(colorHex, scene) {
        const size = 256;
        const dynamicTexture = new BABYLON.DynamicTexture("neonGridTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        // Fondo transparente/oscuro
        ctx.fillStyle = "rgba(10, 10, 15, 1)";
        ctx.fillRect(0, 0, size, size);

        // Líneas exteriores con efecto de resplandor (glow)
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        
        ctx.strokeRect(0, 0, size, size);

        // Líneas cruzadas secundarias sin sombra
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(size/2, 0);
        ctx.lineTo(size/2, size);
        ctx.moveTo(0, size/2);
        ctx.lineTo(size, size/2);
        ctx.stroke();

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea una textura de pared de ladrillos dibujada a mano.
     */
    static createHandDrawnBrickTexture(scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture("handDrawnBrickTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        ctx.fillStyle = "#e2e8f0"; // Gris de fondo cómic
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;

        const rows = 8;
        const cols = 4;
        const rh = size / rows;
        const cw = size / cols;

        // Líneas horizontales wiggled
        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            const y = i * rh;
            ctx.moveTo(0, y);
            for (let x = 10; x <= size; x += 10) {
                const jitter = (Math.random() - 0.5) * 1.5;
                ctx.lineTo(x, y + jitter);
            }
            ctx.stroke();
        }

        // Líneas verticales wiggled
        for (let r = 0; r < rows; r++) {
            const offset = (r % 2) * (cw / 2);
            const yStart = r * rh;
            const yEnd = (r + 1) * rh;
            for (let c = 0; c <= cols + 1; c++) {
                const x = c * cw - offset;
                ctx.beginPath();
                ctx.moveTo(x, yStart);
                for (let y = yStart + 5; y <= yEnd; y += 5) {
                    const jitter = (Math.random() - 0.5) * 1.5;
                    ctx.lineTo(x + jitter, y);
                }
                ctx.stroke();
            }
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea una textura de nebulosa giratoria pastel.
     */
    static createNebulaTexture(scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture("nebulaTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        ctx.fillStyle = "#0c0a09"; // Fondo oscuro espacial
        ctx.fillRect(0, 0, size, size);

        ctx.globalCompositeOperation = "screen";

        // Degradados radiales pastel para simular nebulosas de cómic
        const nebulae = [
            { x: 150, y: 150, r: 180, c1: "rgba(167, 139, 250, 0.45)", c2: "rgba(167, 139, 250, 0)" },
            { x: 380, y: 200, r: 210, c1: "rgba(244, 63, 94, 0.4)", c2: "rgba(244, 63, 94, 0)" },
            { x: 220, y: 360, r: 230, c1: "rgba(56, 189, 248, 0.4)", c2: "rgba(56, 189, 248, 0)" }
        ];

        nebulae.forEach(n => {
            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            grad.addColorStop(0, n.c1);
            grad.addColorStop(1, n.c2);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalCompositeOperation = "source-over";
        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea una textura de nube/puff estilo cómic con contorno.
     */
    static createComicPuffTexture(scene) {
        const size = 128;
        const dynamicTexture = new BABYLON.DynamicTexture("comicPuffTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        ctx.clearRect(0, 0, size, size);

        const circles = [
            { x: 64, y: 64, r: 26 },
            { x: 44, y: 64, r: 18 },
            { x: 84, y: 64, r: 18 },
            { x: 64, y: 44, r: 18 },
            { x: 64, y: 84, r: 18 }
        ];

        // Delinear borde negro primero
        ctx.fillStyle = "#000000";
        circles.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r + 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Rellenar interior blanco
        ctx.fillStyle = "#ffffff";
        circles.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
        });

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea una textura de mancha de tinta estilo cómic.
     */
    static createInkSplatTexture(scene) {
        const size = 128;
        const dynamicTexture = new BABYLON.DynamicTexture("inkSplatTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        ctx.clearRect(0, 0, size, size);

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        const cx = 64, cy = 64;
        ctx.moveTo(cx + 30, cy);
        
        // Generar silueta dentada aleatoria para la tinta
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = 20 + Math.random() * 22;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        // Añadir algunas gotitas dispersas de tinta
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 32 + Math.random() * 16;
            const r = 2.5 + Math.random() * 3.5;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, r, 0, Math.PI * 2);
            ctx.fill();
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea una textura de estrella explosiva tipo cómic.
     */
    static createComicPopTexture(scene) {
        const size = 128;
        const dynamicTexture = new BABYLON.DynamicTexture("comicPopTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        ctx.clearRect(0, 0, size, size);

        const cx = 64, cy = 64;

        // Borde negro exterior
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(cx + 46, cy);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = (i % 2 === 0) ? 46 : 22;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        // Relleno amarillo interior
        ctx.fillStyle = "#fbbf24"; // Amarillo brillante
        ctx.beginPath();
        ctx.moveTo(cx + 40, cy);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = (i % 2 === 0) ? 40 : 17;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        dynamicTexture.update();
        return dynamicTexture;
    }
}
