/**
 * Mini-juego: PILOTO DE ESTRELLAS
 * Cámara FollowCamera - Nave espacial y pista de aros neón.
 */
import { Player }      from '../entities/Player.js';
import { AssetLoader } from '../core/AssetLoader.js';
import { SCENE_CONFIG } from '../config/scene.config.js';

export class SceneFollow {
    constructor(scene, cameraManager, sceneManager) {
        this.scene         = scene;
        this.cameraManager = cameraManager;
        this.sceneManager  = sceneManager;

        this.player = null;
        this.camera = null;
        this.rings  = [];
        this.score  = 0;
        this.config = SCENE_CONFIG.follow;

        // Puntuación extendida
        this.lapCount     = 0;     // número de vueltas completadas
        this._lapPenalty  = false; // penalización en vuelta actual
    }

    async init() {
        this.scene.clearColor = new BABYLON.Color4(
            this.config.clearColor.r,
            this.config.clearColor.g,
            this.config.clearColor.b,
            this.config.clearColor.a
        );

        // ── Iluminación realista ─────────────────────────────────────────────
        const ambient = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambient.intensity = 0.45;
        ambient.diffuse   = new BABYLON.Color3(0.30, 0.40, 0.65);

        const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -2, -1), this.scene);
        dirLight.intensity   = 1.1;
        dirLight.diffuse     = new BABYLON.Color3(0.85, 0.9, 1.0);
        dirLight.specular    = new BABYLON.Color3(0.5, 0.55, 0.8);

        // ── Skybox nebulosa ──────────────────────────────────────────────────
        this.createSkybox();

        // ── Nave del jugador ─────────────────────────────────────────────────
        this.player = new Player(this.scene);

        // Añadir sombras de la nave
        const shadowGenerator = new BABYLON.ShadowGenerator(512, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        this.player.mesh.getChildMeshes().forEach(m => {
            shadowGenerator.addShadowCaster(m);
        });

        // ── Cámara de seguimiento ────────────────────────────────────────────
        this.camera = this.cameraManager.createFollowCamera(this.player.mesh);

        // ── Pista de aros ────────────────────────────────────────────────────
        this.buildRingCourse(shadowGenerator);

        // GlowLayer
        const glow = new BABYLON.GlowLayer('followGlow', this.scene);
        glow.intensity = 0.9;

        // UI
        this.sceneManager.uiController.setupFollowUI(this);
    }

    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateSphere('nebulaSkybox', { diameter: 800, segments: 16 }, this.scene);
        const mat    = new BABYLON.StandardMaterial('nebulaSkyboxMat', this.scene);
        mat.backFaceCulling = false;
        mat.emissiveTexture = AssetLoader.createNebulaTexture(this.scene);
        mat.disableLighting = true;
        skybox.material       = mat;
        skybox.infiniteDistance = true;
        this.nebulaSkybox = skybox;
    }

    buildRingCourse(shadowGenerator) {
        const ringCount     = this.config.ringCount;
        const segmentLength = this.config.tunnelLength / ringCount;

        // Material base de los aros (naranja neón)
        const ringMat = new BABYLON.StandardMaterial('ringMat', this.scene);
        ringMat.diffuseColor  = new BABYLON.Color3(
            this.config.ringColor.r,
            this.config.ringColor.g,
            this.config.ringColor.b
        );
        ringMat.emissiveColor = new BABYLON.Color3(
            this.config.ringColor.r * 0.7,
            this.config.ringColor.g * 0.7,
            this.config.ringColor.b * 0.7
        );
        ringMat.specularColor = new BABYLON.Color3(1, 0.7, 0.2);
        ringMat.specularPower = 32;
        ringMat.disableLighting = false;

        for (let i = 0; i < ringCount; i++) {
            const ring = BABYLON.MeshBuilder.CreateTorus(`ring_${i}`, {
                diameter:     6.5,
                thickness:    0.42,
                tessellation: 28
            }, this.scene);

            const z = 30 + i * segmentLength;
            const x = Math.sin(i * 0.8) * 12;
            const y = Math.cos(i * 0.8) * 6;
            ring.position.set(x, y, z);
            ring.rotation.x = Math.PI / 2;
            ring.material   = ringMat;

            if (shadowGenerator) shadowGenerator.addShadowCaster(ring);

            this.rings.push({ mesh: ring, passed: false });
        }
    }

    triggerRingPuff(position) {
        const ps = new BABYLON.ParticleSystem('ringPuff', 20, this.scene);
        ps.particleTexture = AssetLoader.createComicPuffTexture(this.scene);
        ps.emitter = position.clone();
        ps.minEmitBox = new BABYLON.Vector3(-1.2, -1.2, -0.2);
        ps.maxEmitBox = new BABYLON.Vector3(1.2, 1.2, 0.2);
        ps.color1    = new BABYLON.Color4(1.0, 0.75, 0.1, 1.0);
        ps.colorDead = new BABYLON.Color4(0.1, 0.9, 0.3, 0.0);
        ps.minSize   = 0.4;
        ps.maxSize   = 1.0;
        ps.minLifeTime = 0.3;
        ps.maxLifeTime = 0.7;
        ps.manualEmitCount = 16;
        ps.minEmitPower = 3;
        ps.maxEmitPower = 6;
        ps.direction1 = new BABYLON.Vector3(-1, -1, -0.2);
        ps.direction2 = new BABYLON.Vector3(1, 1, 0.2);
        ps.start();
        setTimeout(() => { ps.stop(); ps.dispose(); }, 900);
    }

    update() {
        const engine    = this.scene.getEngine();
        const deltaTime = engine.getDeltaTime() * 0.001;

        if (this.nebulaSkybox) {
            this.nebulaSkybox.rotate(BABYLON.Axis.Z, 0.0004 * deltaTime * 60, BABYLON.Space.LOCAL);
        }

        if (!this.player) return;

        this.player.update(deltaTime);

        const shipPos = this.player.mesh.position;

        this.rings.forEach(ring => {
            if (ring.passed) return;
            const dist = BABYLON.Vector3.Distance(shipPos, ring.mesh.position);
            if (dist < 3.8) {
                ring.passed = true;
                this.score += 100;

                // Material verde brillante al cruzar
                const passedMat = new BABYLON.StandardMaterial(`passedRing_${ring.mesh.name}`, this.scene);
                passedMat.diffuseColor  = new BABYLON.Color3(0.05, 0.85, 0.15);
                passedMat.emissiveColor = new BABYLON.Color3(0.02, 0.6, 0.08);
                passedMat.specularColor = new BABYLON.Color3(0.5, 1.0, 0.5);
                passedMat.specularPower = 32;
                passedMat.disableLighting = false;
                ring.mesh.material = passedMat;

                // Partículas
                this.triggerRingPuff(ring.mesh.position);

                // Palabras
                const words = ['¡TURBO!', '¡ZAS!', '¡BIEN!', '¡SÚPER!', '¡INCREÍBLE!'];
                this.sceneManager.uiController.showFloatingBubbleAt3D(
                    words[Math.floor(Math.random() * words.length)],
                    ring.mesh.position, this.scene
                );

                // Sonido
                if (this.sceneManager.audioManager) {
                    this.sceneManager.audioManager.playRing();
                }

                // Flash motor
                const engineNode = this.player.mesh.getChildren().find(n => n.name === 'engine');
                if (engineNode && engineNode.material) {
                    engineNode.material.emissiveColor.set(0.2, 0.9, 0.9);
                    setTimeout(() => {
                        if (engineNode && engineNode.material) {
                            engineNode.material.emissiveColor.set(0.9, 0.42, 0.05);
                        }
                    }, 260);
                }
            }
        });

        // Fin de vuelta: reiniciar posición cuando pasa el final del túnel
        if (shipPos.z > this.config.tunnelLength + 50) {
            this.player.mesh.position.set(0, 0, 0);
            this.player.mesh.rotation.set(0, 0, 0);
            this.lapCount++;
            this._resetRings();

            // Guardar récord tras cada vuelta completada
            this.sceneManager.uiController.saveRecord('follow', this.score);
        }

        this.sceneManager.uiController.updateFollowUI(this);
    }

    _resetRings() {
        const ringMat = new BABYLON.StandardMaterial('ringMatReset', this.scene);
        ringMat.diffuseColor  = new BABYLON.Color3(
            this.config.ringColor.r,
            this.config.ringColor.g,
            this.config.ringColor.b
        );
        ringMat.emissiveColor = new BABYLON.Color3(
            this.config.ringColor.r * 0.7,
            this.config.ringColor.g * 0.7,
            this.config.ringColor.b * 0.7
        );
        ringMat.specularColor   = new BABYLON.Color3(1, 0.7, 0.2);
        ringMat.specularPower   = 32;
        ringMat.disableLighting = false;

        this.rings.forEach(ring => {
            ring.passed      = false;
            ring.mesh.material = ringMat;
        });
        this.sceneManager.uiController.updateFollowUI(this);
    }

    dispose() {
        if (this.player) this.player.dispose();
        this.rings.forEach(r => r.mesh.dispose());
    }
}
