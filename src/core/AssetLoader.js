/**
 * AssetLoader utilities for generating procedural textures used across the mini‑games.
 * All textures now use dark backgrounds with high‑contrast stars / nebulae to match the new black clear colors.
 */
// BABYLON is loaded globally via CDN scripts in index.html

export class AssetLoader {
    /** Creates a starfield texture on a black canvas. */
    static createStarsTexture(scene) {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Black background
        ctx.fillStyle = '#060608';
        ctx.fillRect(0, 0, size, size);
        // Draw many tiny white stars
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 0.8 + 0.2;
            const brightness = Math.random() * 0.8 + 0.2;
            ctx.fillStyle = `rgba(255,255,255,${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        const texture = new BABYLON.DynamicTexture('stars', { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
    }

    /** Creates a dark nebula texture with subtle color clouds. */
    static createNebulaTexture(scene) {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Dark base
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, size, size);
        // Add a few colored cloud blobs
        const colors = ['#1e3a8a', '#4c1d95', '#8b5cf6'];
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 150 + 50;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, `${color}44`);
            grad.addColorStop(1, `${color}00`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        const texture = new BABYLON.DynamicTexture('nebula', { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
    }

    /** Creates a neon grid texture (dark background with cyan/red lines). */
    static createNeonGridTexture(scene) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Dark background
        ctx.fillStyle = '#040208';
        ctx.fillRect(0, 0, size, size);
        const step = 32;
        ctx.strokeStyle = '#00e5ff44';
        ctx.lineWidth = 2;
        for (let i = 0; i <= size; i += step) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }
        const texture = new BABYLON.DynamicTexture('neonGrid', { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
    }

    /**
     * Creates a bright sun texture with radial gradient for emissive material.
     * @param {BABYLON.Scene} scene The Babylon.js scene.
     * @returns {BABYLON.DynamicTexture} The generated sun texture.
     */
    static createSunTexture(scene) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255,200,50,1)');
        grad.addColorStop(0.5, 'rgba(255,150,20,0.8)');
        grad.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        const texture = new BABYLON.DynamicTexture('sun', { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
    }

    /** Brick texture for museum walls (dark stone look). */
    static createHandDrawnBrickTexture(scene) {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Dark stone base
        ctx.fillStyle = '#1a1a1f';
        ctx.fillRect(0, 0, size, size);
        // Simple brick pattern (lighter lines)
        const brickW = 64, brickH = 32;
        ctx.strokeStyle = '#2e2e3a';
        ctx.lineWidth = 2;
        for (let y = 0; y < size; y += brickH) {
            for (let x = (Math.floor(y / brickH) % 2) * (brickW / 2); x < size; x += brickW) {
                ctx.strokeRect(x, y, brickW, brickH);
            }
        }
        const texture = new BABYLON.DynamicTexture('brick', { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
    }

    // Existing helpers kept for compatibility
    static createMuseumFloorTexture(scene) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base tile color (elegant dark grey)
        ctx.fillStyle = '#222227';
        ctx.fillRect(0, 0, size, size);

        // Draw tile grid lines
        const tileSize = 128;
        ctx.strokeStyle = '#111113';
        ctx.lineWidth = 4;
        for (let x = 0; x <= size; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, x);
            ctx.lineTo(size, x);
            ctx.stroke();
        }

        // Add some noise or marble veins inside each tile to look premium
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * size, Math.random() * size);
            ctx.bezierCurveTo(
                Math.random() * size, Math.random() * size,
                Math.random() * size, Math.random() * size,
                Math.random() * size, Math.random() * size
            );
            ctx.stroke();
        }

        const texture = new BABYLON.DynamicTexture('museumFloor', { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
    }

    static createPlanetTexture(name, scene) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw based on planet name
        if (name === 'mercury') {
            // Grey rocky planet with craters
            ctx.fillStyle = '#6e6e73';
            ctx.fillRect(0, 0, size, size);
            
            // Draw some craters/spots
            ctx.fillStyle = '#545459';
            for (let i = 0; i < 40; i++) {
                const cx = Math.random() * size;
                const cy = Math.random() * size;
                const cr = Math.random() * 20 + 5;
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                ctx.fill();
                
                // Craters highlights/shadows
                ctx.strokeStyle = '#8a8a91';
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI);
                ctx.stroke();
            }
        } else if (name === 'venus') {
            // Yellowish orange thick atmosphere with acidic clouds
            ctx.fillStyle = '#d9a05b';
            ctx.fillRect(0, 0, size, size);
            
            // Subtle horizontal/diagonal cloud streaks
            for (let i = 0; i < 30; i++) {
                const y = Math.random() * size;
                const h = Math.random() * 60 + 20;
                const grad = ctx.createLinearGradient(0, y, 0, y + h);
                grad.addColorStop(0, 'rgba(242, 214, 162, 0.4)');
                grad.addColorStop(1, 'rgba(217, 126, 74, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, y, size, h);
            }
        } else if (name === 'earth') {
            // Blue oceans, green/brown landmasses, white clouds
            ctx.fillStyle = '#1b4b8a'; // Deep blue ocean
            ctx.fillRect(0, 0, size, size);
            
            // Draw random green/brown landmass blobs
            ctx.fillStyle = '#2d6a4f';
            for (let i = 0; i < 15; i++) {
                const cx = Math.random() * size;
                const cy = Math.random() * size;
                const cr = Math.random() * 80 + 40;
                
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                ctx.fill();
                
                // Add some brown details in the center of landmasses
                ctx.fillStyle = '#8c6239';
                ctx.beginPath();
                ctx.arc(cx, cy, cr * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2d6a4f'; // Restore fillStyle
            }
            
            // White cloud swirls
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 100 + 50, Math.random() * 20 + 5, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (name === 'mars') {
            // Red/orange rusty planet with white polar caps and dark dunes
            ctx.fillStyle = '#c15c3d';
            ctx.fillRect(0, 0, size, size);
            
            // Dark dunes
            ctx.fillStyle = '#823720';
            for (let i = 0; i < 12; i++) {
                const cx = Math.random() * size;
                const cy = Math.random() * size;
                const cr = Math.random() * 90 + 30;
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // White polar caps at the "top" and "bottom" of the texture (which wrap around the poles)
            ctx.fillStyle = '#f7f4f0';
            ctx.fillRect(0, 0, size, 40);
            ctx.fillRect(0, size - 40, size, 40);
        } else if (name === 'jupiter') {
            // Horizontal bands of orange, yellow, brown, white, and a Great Red Spot
            ctx.fillStyle = '#e5a65d';
            ctx.fillRect(0, 0, size, size);
            
            const colors = ['#b87431', '#d8a061', '#f3d9b1', '#a56020', '#ebd3b4'];
            for (let y = 0; y < size; y += 16) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                const h = Math.random() * 32 + 8;
                ctx.fillRect(0, y, size, h);
                y += h - 16; // increment y based on variable height
            }
            
            // Great Red Spot (ellipse around 70% height, 60% width)
            ctx.fillStyle = '#b33925';
            ctx.beginPath();
            ctx.ellipse(size * 0.6, size * 0.7, 45, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Swirl inside Great Red Spot
            ctx.fillStyle = '#d96e5d';
            ctx.beginPath();
            ctx.ellipse(size * 0.6, size * 0.7, 30, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Fallback generic planet
            ctx.fillStyle = '#7a7a7a';
            ctx.fillRect(0, 0, size, size);
        }

        const texture = new BABYLON.DynamicTexture(`${name}Texture`, { width: size, height: size }, scene, false);
        texture.getContext().drawImage(canvas, 0, 0);
        texture.update();
        return texture;
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
