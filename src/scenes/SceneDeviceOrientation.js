/**
 * Mini-juego: CAZADOR DE ASTEROIDES
 * Cámara DeviceOrientationCamera / arrastre en PC - Tiro al blanco espacial.
 */
import { Enemy }        from '../entities/Enemy.js';
import { AssetLoader }  from '../core/AssetLoader.js';
import { SCENE_CONFIG } from '../config/scene.config.js';

export class SceneDeviceOrientation {
    constructor(scene, cameraManager, sceneManager) {
        this.scene         = scene;
        this.cameraManager = cameraManager;
        this.sceneManager  = sceneManager;

        this.camera     = null;
        this.targets    = [];
        this.score      = 0;
        this.shotsFired = 0;
        this.streak     = 0;      // Racha de aciertos consecutivos
        this.maxStreak  = 0;
        this.maxTargets = SCENE_CONFIG.deviceOrientation.targetCount;
        this.config     = SCENE_CONFIG.deviceOrientation;

        this.onShootBind = this.shootLaser.bind(this);
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
        ambient.intensity = 0.28;
        ambient.diffuse   = new BABYLON.Color3(0.38, 0.42, 0.62);
        ambient.groundColor = new BABYLON.Color3(0.05, 0.06, 0.12);

        const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(1, 1, 1), this.scene);
        dirLight.intensity = 0.85;
        dirLight.diffuse   = new BABYLON.Color3(0.9, 0.92, 1.0);
        dirLight.specular  = new BABYLON.Color3(0.6, 0.65, 1.0);

        // ── Cámara ──────────────────────────────────────────────────────────
        this.camera = this.cameraManager.createDeviceOrientationCamera();

        // ── Skybox ──────────────────────────────────────────────────────────
        this.createSkybox();

        // ── Asteroides ──────────────────────────────────────────────────────
        this.spawnInitialTargets();

        // GlowLayer
        const glow = new BABYLON.GlowLayer('gyroGlow', this.scene);
        glow.intensity = 0.9;

        // UI y eventos
        this.sceneManager.uiController.setupDeviceOrientationUI(this);
        this.setupInputEvents();
    }

    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 500 }, this.scene);
        const mat    = new BABYLON.StandardMaterial('skyBoxMat', this.scene);
        mat.backFaceCulling  = false;
        mat.diffuseTexture   = AssetLoader.createStarsTexture(this.scene);
        mat.specularColor    = BABYLON.Color3.Black();
        mat.disableLighting  = true;
        skybox.material      = mat;
        skybox.infiniteDistance = true;
    }

    spawnInitialTargets() {
        for (let i = 0; i < this.maxTargets; i++) {
            this.spawnRandomTarget(`asteroid_${i}`);
        }
    }

    spawnRandomTarget(id) {
        const radius = this.config.spawnRadius;
        const u = Math.random(), v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi   = Math.acos(2.0 * v - 1.0);
        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = Math.sin(phi) * Math.sin(theta) * 6;
        let z = radius * Math.cos(phi);

        const pos = new BABYLON.Vector3(x, y, z);
        if (BABYLON.Vector3.Distance(pos, BABYLON.Vector3.Zero()) < 8) pos.z += 10;

        // Increase asteroid size to make them easier to hit (1.5x original)
        const baseSize = this.config.targetSizes.min +
            Math.random() * (this.config.targetSizes.max - this.config.targetSizes.min);
        const size = baseSize * 1.5;

        const asteroid = new Enemy(id, pos, size, this.scene);
        const speed = this.config.approachSpeed.min + Math.random() * (this.config.approachSpeed.max - this.config.approachSpeed.min);
        asteroid.setTarget(BABYLON.Vector3.Zero(), speed);
        this.targets.push(asteroid);
    }

    setupInputEvents() {
        // Existing input events
        const shootBtn = document.getElementById('btn-shoot');
        if (shootBtn) shootBtn.addEventListener('click', this.onShootBind);

        this.onKeyDown = (e) => {
            if (e.keyCode === 32) { e.preventDefault(); this.shootLaser(); }
            // Manual victory (V) and game over (G) shortcuts for testing
            if (e.key === 'v' || e.key === 'V') {
                if (this.sceneManager.audioManager) this.sceneManager.audioManager.playVictory();
                if (this.sceneManager.uiController) this.sceneManager.uiController.triggerVictory('¡Victoria!', this.score, 'deviceOrientation');
            }
            if (e.key === 'g' || e.key === 'G') {
                if (this.sceneManager.audioManager) this.sceneManager.audioManager.playGameOver();
                if (this.sceneManager.uiController) this.sceneManager.uiController.triggerGameOver('Game Over', this.score, 'deviceOrientation');
            }
        };
        window.addEventListener('keydown', this.onKeyDown);

        // Fallback de arrastre del ratón para PC/Escritorio
        let isDragging = false;
        let prevX = 0;
        let prevY = 0;

        this.onPointerDown = (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        };

        this.onPointerMove = (e) => {
            if (!isDragging || !this.camera) return;
            const dx = e.clientX - prevX;
            const dy = e.clientY - prevY;

            // Sensibilidad configurada o valor por defecto
            const speed = this.config.desktopSpeed || 0.003;
            this.camera.rotation.y += dx * speed;
            this.camera.rotation.x += dy * speed;

            // Limitar rotación vertical para evitar voltear
            const limit = Math.PI / 2.1;
            if (this.camera.rotation.x > limit) this.camera.rotation.x = limit;
            if (this.camera.rotation.x < -limit) this.camera.rotation.x = -limit;

            prevX = e.clientX;
            prevY = e.clientY;
        };

        this.onPointerUp = () => {
            isDragging = false;
        };

        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            canvas.addEventListener('pointerdown', this.onPointerDown);
            canvas.addEventListener('pointermove', this.onPointerMove);
            canvas.addEventListener('pointerup', this.onPointerUp);
        }
    }

    shootLaser() {
        if (!this.camera) return;
        this.shotsFired++;

        // Burbuja de disparo
        this.sceneManager.uiController.showFloatingComicBubble(
            Math.random() > 0.5 ? '¡BANG!' : '¡FUEGO!',
            window.innerWidth / 2,
            window.innerHeight / 2
        );

        // Sonido de disparo
        if (this.sceneManager.audioManager) {
            this.sceneManager.audioManager.playShoot();
        }

        // Dirección del láser
        const forward    = this.camera.getForwardRay().direction;
        const origin     = this.camera.position.clone();
        origin.y        -= 0.5;
        const targetPoint = origin.add(forward.scale(50));

        // Visualización del láser
        const laser = BABYLON.MeshBuilder.CreateCylinder('laser', {
            height: 50, diameterTop: 0.07, diameterBottom: 0.07
        }, this.scene);
        laser.position = BABYLON.Vector3.Center(origin, targetPoint);
        laser.lookAt(targetPoint);
        laser.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);

        const laserMat = new BABYLON.StandardMaterial('laserMat', this.scene);
        laserMat.emissiveColor  = new BABYLON.Color3(0.0, 0.9, 1.0);
        laserMat.disableLighting = true;
        laser.material = laserMat;

        let alpha = 1.0;
        const fadeInterval = setInterval(() => {
            alpha -= 0.15;
            if (laserMat) laserMat.alpha = alpha;
            if (alpha <= 0) { clearInterval(fadeInterval); laser.dispose(); }
        }, 30);

        // Raycast
        const ray = this.scene.createPickingRay(
            this.scene.getEngine().getRenderWidth() / 2,
            this.scene.getEngine().getRenderHeight() / 2,
            BABYLON.Matrix.Identity(),
            this.camera
        );
        const hit = this.scene.pickWithRay(ray);

        if (hit.pickedMesh) {
            const hitName    = hit.pickedMesh.name;
            const targetIdx  = this.targets.findIndex(t => t.mesh && t.mesh.name === hitName);
            if (targetIdx !== -1) {
                const asteroid = this.targets[targetIdx];
                const hitPos   = asteroid.mesh.position.clone();
                this.targets.splice(targetIdx, 1);

                // Puntuación con multiplicador de racha
                this.streak++;
                if (this.streak > this.maxStreak) this.maxStreak = this.streak;
                const bonus = this.streak >= 3 ? Math.floor(this.streak * 50) : 0;
                this.score += 250 + bonus;

                // Sonido de impacto
                if (this.sceneManager.audioManager) {
                    this.sceneManager.audioManager.playHit();
                }

                // Burbuja de impacto
                const hits = ['¡PUM!', '¡BOOM!', '¡ZAS!', '¡KABOOM!', '¡PLAF!'];
                let text = hits[Math.floor(Math.random() * hits.length)];
                if (this.streak >= 3) text = `RACHA x${this.streak}!`;
                this.sceneManager.uiController.showFloatingBubbleAt3D(text, hitPos, this.scene);

                asteroid.explode().then(() => {
                    setTimeout(() => {
                        this.spawnRandomTarget(`asteroid_${Date.now()}`);
                        this.sceneManager.uiController.updateDeviceOrientationUI(this);
                    }, 1000);
                });
            } else {
                // Fallo: penalización y reseteo de racha
                this.score   = Math.max(0, this.score - 50);
                this.streak  = 0;
            }
        } else {
            // Fallo al vacío
            this.score  = Math.max(0, this.score - 25);
            this.streak = 0;
        }

        // Guardar récord continuamente
        this.sceneManager.uiController.saveRecord('deviceOrientation', this.score);
        this.sceneManager.uiController.updateDeviceOrientationUI(this);
    }

    update() {
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const asteroid = this.targets[i];
            asteroid.update();

            if (asteroid.mesh) {
                const dist = BABYLON.Vector3.Distance(asteroid.mesh.position, BABYLON.Vector3.Zero());
                if (dist < this.config.damageRadius) {
                    // Explota el asteroide visualmente
                    asteroid.explode();

                    // Remueve de los objetivos activos
                    this.targets.splice(i, 1);

                    // Penalización de daño
                    this.score = Math.max(0, this.score - this.config.damagePenalty);
                    this.streak = 0;

                    // Sonido de impacto contra el jugador
                    if (this.sceneManager.audioManager) {
                        this.sceneManager.audioManager.playHit();
                    }

                    // Mensaje de impacto
                    this.sceneManager.uiController.showFloatingComicBubble(
                        '¡IMPACTO! -100',
                        window.innerWidth / 2,
                        window.innerHeight / 2
                    );

                    // Genera uno nuevo tras 1 segundo
                    setTimeout(() => {
                        this.spawnRandomTarget(`asteroid_${Date.now()}`);
                        this.sceneManager.uiController.updateDeviceOrientationUI(this);
                    }, 1000);

                    // Actualiza puntuación y UI
                    this.sceneManager.uiController.saveRecord('deviceOrientation', this.score);
                    this.sceneManager.uiController.updateDeviceOrientationUI(this);
                }
            }
        }
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        const shootBtn = document.getElementById('btn-shoot');
        if (shootBtn) shootBtn.removeEventListener('click', this.onShootBind);

        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            if (this.onPointerDown) canvas.removeEventListener('pointerdown', this.onPointerDown);
            if (this.onPointerMove) canvas.removeEventListener('pointermove', this.onPointerMove);
            if (this.onPointerUp) canvas.removeEventListener('pointerup', this.onPointerUp);
        }

        const actionOverlay = document.getElementById('action-overlay');
        if (actionOverlay) actionOverlay.style.display = 'none';
        this.targets.forEach(t => t.dispose());
    }
}
