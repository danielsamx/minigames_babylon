import { AssetLoader } from '../core/AssetLoader.js';

/**
 * Asteroide/objetivo en el juego Cazador de Asteroides.
 * Material realista rocoso con iluminación habilitada.
 */
export class Enemy {
    /**
     * @param {string} id
     * @param {BABYLON.Vector3} position
     * @param {number} size
     * @param {BABYLON.Scene} scene
     */
    constructor(id, position, size, scene) {
        this.id       = id;
        this.position = position;
        this.size     = size;
        this.scene    = scene;
        this.mesh     = null;
        this.rotSpeed = new BABYLON.Vector3(
            (Math.random() - 0.5) * 0.025,
            (Math.random() - 0.5) * 0.025,
            (Math.random() - 0.5) * 0.025
        );
        // Enemy AI target and speed (default 0 means static)
        this.target        = null; // BABYLON.Vector3
        this.approachSpeed = 0;   // units per frame, will be set per scene
        this.create();
    }

    create() {
        // Esfera con más segmentos para mejor iluminación
        this.mesh = BABYLON.MeshBuilder.CreateSphere(this.id, {
            diameter: this.size,
            segments: 14
        }, this.scene);

        this.mesh.position.copyFrom(this.position);

        // Deformación procedural para aspecto rocoso/irregular
        const positions = this.mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const n = positions.length / 3;
        for (let i = 0; i < n; i++) {
            const f = 1 + (Math.random() - 0.5) * 0.22;
            positions[i * 3]     *= f;
            positions[i * 3 + 1] *= f;
            positions[i * 3 + 2] *= f;
        }
        this.mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

        // Recalcular normales
        const indices = this.mesh.getIndices();
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        this.mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);

        // ── Material realista: roca espacial ──────────────────────────────────
        const mat = new BABYLON.StandardMaterial(`${this.id}Mat`, this.scene);

        // Colores naturales de roca oscura con variación
        const hue = 0.35 + Math.random() * 0.15;
        mat.diffuseColor  = new BABYLON.Color3(hue, hue * 0.9, hue * 0.8);
        mat.specularColor = new BABYLON.Color3(0.12, 0.10, 0.08);
        mat.specularPower = 8;
        mat.ambientColor  = new BABYLON.Color3(0.04, 0.04, 0.05);

        // Textura procedural de roca (uso de DynamicTexture con ruido)
        const texSize = 256;
        const rockTex = new BABYLON.DynamicTexture(`${this.id}Tex`, { width: texSize, height: texSize }, this.scene, false);
        const ctx = rockTex.getContext();
        // Base oscura
        ctx.fillStyle = `rgb(${Math.floor(hue*200)},${Math.floor(hue*185)},${Math.floor(hue*165)})`;
        ctx.fillRect(0, 0, texSize, texSize);
        // Puntos de variación para simular cráteres y rugosidad
        for (let i = 0; i < 320; i++) {
            const x = Math.random() * texSize;
            const y = Math.random() * texSize;
            const r = 1 + Math.random() * 6;
            const bright = Math.random() > 0.5;
            const shade  = bright ? Math.floor(55 + Math.random() * 70) : Math.floor(10 + Math.random() * 40);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${shade},${shade},${shade},0.55)`;
            ctx.fill();
        }
        rockTex.update();
        mat.diffuseTexture = rockTex;

        // Desactivar lighting false (activar iluminación real)
        mat.disableLighting = false;

        this.mesh.material = mat;

        // Contorno suave
        this.mesh.renderOutline = true;
        this.mesh.outlineColor  = new BABYLON.Color3(0.05, 0.05, 0.06);
        this.mesh.outlineWidth  = 0.025;
    }

    update() {
        if (this.mesh) {
            // rotate for visual flair
            this.mesh.rotation.addInPlace(this.rotSpeed);
            // move towards target if defined
            if (this.target && this.approachSpeed > 0) {
                const dir = this.target.subtract(this.mesh.position);
                const distance = dir.length();
                if (distance > this.approachSpeed) {
                    dir.normalize();
                    this.mesh.position.addInPlace(dir.scale(this.approachSpeed));
                } else {
                    // reached target – stop moving
                    this.mesh.position.copyFrom(this.target);
                    this.target = null;
                }
            }
        }
    }

    /**
     * Set a movement target for the enemy and its approach speed.
     * @param {BABYLON.Vector3} targetPos Position to chase.
     * @param {number} speed Units per frame (e.g., 0.02).
     */
    setTarget(targetPos, speed) {
        this.target = targetPos.clone();
        this.approachSpeed = speed;
    }

    /**
     * Explosión de partículas al ser destruido.
     */
    explode() {
        return new Promise((resolve) => {
            if (!this.mesh) { resolve(); return; }

            const expSys = new BABYLON.ParticleSystem('explosion', 45, this.scene);
            expSys.particleTexture = AssetLoader.createInkSplatTexture(this.scene);
            expSys.emitter = this.mesh.position.clone();
            expSys.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
            expSys.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);

            // Partículas naranjas/rojas de fuego
            expSys.color1    = new BABYLON.Color4(1.0, 0.55, 0.1,  1.0);
            expSys.color2    = new BABYLON.Color4(0.9, 0.2,  0.05, 0.8);
            expSys.colorDead = new BABYLON.Color4(0.2, 0.05, 0.0,  0.0);

            expSys.minSize    = 0.4 * this.size;
            expSys.maxSize    = 1.4 * this.size;
            expSys.minLifeTime = 0.2;
            expSys.maxLifeTime = 0.7;
            expSys.manualEmitCount = 55;
            expSys.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            expSys.direction1 = new BABYLON.Vector3(-1, -1, -1);
            expSys.direction2 = new BABYLON.Vector3(1,  1,  1);
            expSys.minEmitPower = 4;
            expSys.maxEmitPower = 14;

            expSys.start();
            this.mesh.dispose();
            this.mesh = null;

            setTimeout(() => {
                expSys.stop();
                expSys.dispose();
                resolve();
            }, 700);
        });
    }

    dispose() {
        if (this.mesh) this.mesh.dispose();
    }
}
