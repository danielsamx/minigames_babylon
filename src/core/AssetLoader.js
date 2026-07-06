/**
 * Cargador y generador de texturas procedurales dinámicas.
 * Evita la dependencia de archivos de imágenes externos y permite que la app funcione offline.
 */
import { ASSETS_CONFIG } from '../config/assets.config.js';

export class AssetLoader {
    /**
     * Crea una textura de cielo estrellado para el Skybox.
     * Fondo negro espacio con estrellas brillantes.
     */
    static createStarsTexture(scene) {
        const size = 1024;
        const dynamicTexture = new BABYLON.DynamicTexture("starsTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        // Fondo negro espacio profundo
        ctx.fillStyle = "#060608";
        ctx.fillRect(0, 0, size, size);

        // Capa 1: estrellas lejanas pequeñas y numerosas
        const density = ASSETS_CONFIG.textures.stars.density;
        for (let i = 0; i < density; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 0.4 + Math.random() * 0.9;
            const alpha  = 0.3 + Math.random() * 0.7;
            const grey   = Math.floor(180 + Math.random() * 75);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${grey},${grey},${Math.min(255, grey + 20)})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Capa 2: estrellas brillantes con halo
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 1.5 + Math.random() * 2.0;
            // Halo suave
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
            const starColors = ['rgba(200,220,255,', 'rgba(255,245,200,', 'rgba(220,200,255,'];
            const col = starColors[Math.floor(Math.random() * starColors.length)];
            grad.addColorStop(0, col + '0.9)');
            grad.addColorStop(0.5, col + '0.3)');
            grad.addColorStop(1,   col + '0)');
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea la textura procedural del Sol (plasma incandescente).
     */
    static createSunTexture(scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture("sunTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        const conf = ASSETS_CONFIG.textures.sun;

        // Degradado radial plasma incandescente
        const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
        grad.addColorStop(0,   '#ffffff');
        grad.addColorStop(0.1, '#ffffcc');
        grad.addColorStop(0.3, conf.baseColor);
        grad.addColorStop(0.75, conf.glowColor);
        grad.addColorStop(1,   '#7c2d12');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Flares y destellos solares
        for (let i = 0; i < 28; i++) {
            ctx.globalAlpha = 0.15 + Math.random() * 0.25;
            ctx.strokeStyle = i % 2 === 0 ? '#fef08a' : '#fdba74';
            ctx.lineWidth = 1 + Math.random() * 4;
            ctx.beginPath();
            ctx.arc(size/2, size/2, 70 + Math.random() * 120, Math.random() * Math.PI, Math.random() * Math.PI * 2);
            ctx.stroke();
        }

        // Manchas solares
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#78350f';
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist  = 40 + Math.random() * 80;
            ctx.beginPath();
            ctx.ellipse(size/2 + Math.cos(angle)*dist, size/2 + Math.sin(angle)*dist, 8 + Math.random()*18, 5 + Math.random()*10, angle, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Crea texturas procedurales para los planetas.
     */
    static createPlanetTexture(planetKey, scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture(`${planetKey}Tex`, size, scene, true);
        const ctx = dynamicTexture.getContext();
        const conf = ASSETS_CONFIG.textures[planetKey];

        if (!conf) {
            ctx.fillStyle = "#888888";
            ctx.fillRect(0, 0, size, size);
            dynamicTexture.update();
            return dynamicTexture;
        }

        ctx.fillStyle = conf.baseColor;
        ctx.fillRect(0, 0, size, size);

        if (planetKey === 'mercury' || planetKey === 'mars') {
            // Cráteres + rugosidad
            ctx.fillStyle = conf.craterColor || conf.darkColor;
            for (let i = 0; i < conf.craters; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 10 + Math.random() * 30;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                // Borde iluminado
                ctx.strokeStyle = "rgba(255,255,255,0.18)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
                ctx.stroke();
            }
            // Rugosidad adicional
            for (let i = 0; i < 300; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                ctx.globalAlpha = 0.12;
                ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
                ctx.fillRect(x, y, 2, 2);
            }
            ctx.globalAlpha = 1;
        } else if (planetKey === 'venus' || planetKey === 'jupiter') {
            // Bandas atmosféricas
            for (let i = 0; i < conf.bands; i++) {
                ctx.fillStyle = i % 2 === 0 ? conf.cloudColor || conf.bandColor : conf.baseColor;
                const h = 20 + Math.random() * 40;
                const y = (size / conf.bands) * i;
                ctx.fillRect(0, y, size, h);
            }
            if (planetKey === 'jupiter') {
                // Gran Mancha Roja
                ctx.fillStyle = conf.spotColor;
                ctx.beginPath();
                ctx.ellipse(size * 0.6, size * 0.65, 45, 25, 0, 0, Math.PI * 2);
                ctx.fill();
                // Bordes oscuros de bandas
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 3;
                for (let i = 0; i < conf.bands; i++) {
                    const y = (size / conf.bands) * i;
                    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(size,y); ctx.stroke();
                }
            }
        } else if (planetKey === 'earth') {
            // Océanos base
            ctx.fillStyle = conf.landColor;
            for (let i = 0; i < 8; i++) {
                const cx = size * 0.2 + Math.random() * (size * 0.6);
                const cy = size * 0.2 + Math.random() * (size * 0.6);
                const r  = 60 + Math.random() * 80;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
                for (let j = 0; j < 3; j++) {
                    ctx.beginPath();
                    ctx.arc(cx + (Math.random()-0.5)*80, cy + (Math.random()-0.5)*80, r*0.5, 0, Math.PI*2);
                    ctx.fill();
                }
            }
            // Nubes
            ctx.fillStyle = conf.cloudColor;
            ctx.globalAlpha = 0.45;
            for (let i = 0; i < 5; i++) {
                const y = Math.random() * size;
                ctx.beginPath();
                ctx.ellipse(size/2, y, size*0.45, 15+Math.random()*20, 0.05, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Textura de suelo de museo (mármol oscuro lujoso).
     */
    static createMuseumFloorTexture(scene) {
        const size = ASSETS_CONFIG.textures.museumFloor.gridSize;
        const dynamicTexture = new BABYLON.DynamicTexture("museumFloorTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        const conf = ASSETS_CONFIG.textures.museumFloor;

        // Mármol oscuro
        ctx.fillStyle = conf.primary;
        ctx.fillRect(0, 0, size, size);

        // Bordes de baldosa
        ctx.strokeStyle = conf.secondary;
        ctx.lineWidth = 6;
        ctx.strokeRect(0, 0, size, size);

        // Vetas de mármol
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 7; i++) {
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
     * Textura de cuadrícula de neón sobre fondo negro.
     */
    static createNeonGridTexture(colorHex, scene) {
        const size = 256;
        const dynamicTexture = new BABYLON.DynamicTexture("neonGridTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        // Fondo negro para laberinto neon
        ctx.fillStyle = "#040208";
        ctx.fillRect(0, 0, size, size);

        // Líneas de neón con glow
        ctx.shadowColor = colorHex;
        ctx.shadowBlur  = 12;
        ctx.strokeStyle = colorHex;
        ctx.lineWidth   = 2;
        ctx.strokeRect(4, 4, size-8, size-8);

        // Líneas internas sutiles
        ctx.shadowBlur  = 4;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(size/2, 4); ctx.lineTo(size/2, size-4);
        ctx.moveTo(4, size/2); ctx.lineTo(size-4, size/2);
        ctx.stroke();

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1.0;
        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Textura de pared de piedra oscura para el museo.
     */
    static createHandDrawnBrickTexture(scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture("handDrawnBrickTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        // Fondo piedra oscura
        ctx.fillStyle = "#1a1a1f";
        ctx.fillRect(0, 0, size, size);

        // Variación de color procedural por ladrillo
        const rows = 8;
        const cols = 4;
        const rh = size / rows;
        const cw = size / cols;

        for (let r = 0; r < rows; r++) {
            const offset = (r % 2) * (cw / 2);
            for (let c = 0; c < cols + 1; c++) {
                const x = c * cw - offset;
                const y = r * rh;
                const grey = Math.floor(22 + Math.random() * 18);
                ctx.fillStyle = `rgb(${grey},${grey},${grey + 3})`;
                ctx.fillRect(x + 3, y + 3, cw - 6, rh - 6);
            }
        }

        // Mortero (líneas entre ladrillos)
        ctx.strokeStyle = "#0d0d12";
        ctx.lineWidth = 5;

        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            const y = i * rh;
            ctx.moveTo(0, y);
            for (let x = 10; x <= size; x += 10) {
                ctx.lineTo(x, y + (Math.random() - 0.5) * 1.2);
            }
            ctx.stroke();
        }

        for (let r = 0; r < rows; r++) {
            const offset = (r % 2) * (cw / 2);
            const yStart = r * rh;
            const yEnd   = (r + 1) * rh;
            for (let c = 0; c <= cols + 1; c++) {
                const x = c * cw - offset;
                ctx.beginPath();
                ctx.moveTo(x, yStart);
                for (let y = yStart + 5; y <= yEnd; y += 5) {
                    ctx.lineTo(x + (Math.random()-0.5)*1.2, y);
                }
                ctx.stroke();
            }
        }

        // Brillo sutil en bordes superiores de ladrillos
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let r = 0; r < rows; r++) {
            const offset = (r % 2) * (cw / 2);
            const y = r * rh + 4;
            for (let c = 0; c <= cols + 1; c++) {
                const x = c * cw - offset;
                ctx.beginPath();
                ctx.moveTo(x + 4, y); ctx.lineTo(x + cw - 4, y);
                ctx.stroke();
            }
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Textura de nebulosa oscura para skybox espacial.
     */
    static createNebulaTexture(scene) {
        const size = 512;
        const dynamicTexture = new BABYLON.DynamicTexture("nebulaTex", size, scene, true);
        const ctx = dynamicTexture.getContext();

        // Fondo negro espacio
        ctx.fillStyle = "#020408";
        ctx.fillRect(0, 0, size, size);

        // Estrellas de fondo
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 0.3 + Math.random() * 0.8;
            ctx.globalAlpha = 0.25 + Math.random() * 0.65;
            ctx.fillStyle = `rgba(200,210,255,1)`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Nubes de nebulosa vibrantes
        const nebulae = [
            { x: 150, y: 150, r: 200, c1: "rgba(120,60,220,0.45)", c2: "rgba(80,0,160,0)" },
            { x: 370, y: 200, r: 180, c1: "rgba(220,30,80,0.35)",  c2: "rgba(150,0,40,0)" },
            { x: 210, y: 370, r: 220, c1: "rgba(20,140,220,0.40)", c2: "rgba(0,60,150,0)" },
            { x: 420, y: 400, r: 160, c1: "rgba(50,200,150,0.30)", c2: "rgba(0,100,80,0)"  }
        ];

        nebulae.forEach(n => {
            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            grad.addColorStop(0, n.c1);
            grad.addColorStop(1, n.c2);
            ctx.fillStyle = grad;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Textura de nube/puff para partículas de impacto.
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

        ctx.fillStyle = "#000000";
        circles.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r + 4, 0, Math.PI * 2);
            ctx.fill();
        });

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
     * Textura de mancha/explosión para partículas de daño.
     */
    static createInkSplatTexture(scene) {
        const size = 128;
        const dynamicTexture = new BABYLON.DynamicTexture("inkSplatTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        ctx.clearRect(0, 0, size, size);

        // Fondo circular suave
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 55);
        grad.addColorStop(0, 'rgba(255,120,20,0.95)');
        grad.addColorStop(0.5, 'rgba(200,40,0,0.7)');
        grad.addColorStop(1, 'rgba(100,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(64, 64, 55, 0, Math.PI * 2);
        ctx.fill();

        // Picos de la explosión
        ctx.fillStyle = "rgba(255,200,50,0.8)";
        const cx = 64, cy = 64;
        ctx.beginPath();
        ctx.moveTo(cx + 30, cy);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = 20 + Math.random() * 22;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Textura de estrella explosiva para impactos en planetas.
     */
    static createComicPopTexture(scene) {
        const size = 128;
        const dynamicTexture = new BABYLON.DynamicTexture("comicPopTex", size, scene, true);
        const ctx = dynamicTexture.getContext();
        ctx.clearRect(0, 0, size, size);

        const cx = 64, cy = 64;

        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx + 46, cy);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = (i % 2 === 0) ? 46 : 22;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.moveTo(cx + 38, cy);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = (i % 2 === 0) ? 38 : 17;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        dynamicTexture.update();
        return dynamicTexture;
    }
}
