/**
 * Mini-juego: ÓRBITA CÓSMICA
 * Cámara ArcRotate - Sistema Solar Interactivo con puntuación y sonido.
 */
import { Planet }      from '../entities/Planet.js';
import { AssetLoader } from '../core/AssetLoader.js';
import { SCENE_CONFIG } from '../config/scene.config.js';

export class SceneArcRotate {
    constructor(scene, cameraManager, sceneManager) {
        this.scene        = scene;
        this.cameraManager = cameraManager;
        this.sceneManager  = sceneManager;

        this.camera  = null;
        this.planets = [];
        this.sun     = null;

        this.timeScale    = 1.0;
        this.focusedIndex = -1;
        this.config       = SCENE_CONFIG.arcRotate;

        // Sistema de puntuación
        this.score          = 0;
        this.visitedPlanets = new Set();
        this._victoryFired  = false;
    }

    async init() {
        // Color de fondo
        this.scene.clearColor = new BABYLON.Color4(
            this.config.clearColor.r,
            this.config.clearColor.g,
            this.config.clearColor.b,
            this.config.clearColor.a
        );

        // ── Iluminación realista ─────────────────────────────────────────────
        // Luz puntual del Sol
        const sunLight = new BABYLON.PointLight('sunLight', BABYLON.Vector3.Zero(), this.scene);
        sunLight.intensity = 2.2;
        sunLight.range     = 120;
        sunLight.diffuse   = new BABYLON.Color3(1.0, 0.95, 0.8);

        // Luz ambiental suave
        const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambient.intensity  = 0.18;
        ambient.groundColor = new BABYLON.Color3(0.04, 0.04, 0.08);
        ambient.diffuse    = new BABYLON.Color3(0.12, 0.12, 0.18);

        // ── Cámara ──────────────────────────────────────────────────────────
        this.camera = this.cameraManager.createArcRotateCamera();

        // ── Skybox + Sol ─────────────────────────────────────────────────────
        this.createSkybox();
        this.createSun();

        // ── Planetas ─────────────────────────────────────────────────────────
        const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter'];
        planetKeys.forEach(key => {
            const planet = new Planet(
                key,
                this.config.planetSizes[key],
                this.config.orbitRadii[key],
                this.config.orbitSpeeds[key],
                this.scene
            );
            this.planets.push(planet);
        });

        // UI
        this.sceneManager.uiController.setupArcRotateUI(this);

        // Clic en planetas
        this.planets.forEach(planet => {
            if (!planet.mesh) return;
            const mesh = planet.mesh;
            mesh.actionManager = new BABYLON.ActionManager(this.scene);
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                    this._onPlanetClick(planet, mesh);
                })
            );
        });
    }

    _onPlanetClick(planet, mesh) {
        const name = planet.name;

        // Efecto de explosión de partículas
        this.triggerPopParticles(mesh.position);

        // Burbuja flotante
        const labels = ['¡POP!', '¡ZAS!', '¡KABOOM!', '¡CRASH!', '¡BOING!'];
        this.sceneManager.uiController.showFloatingBubbleAt3D(
            labels[Math.floor(Math.random() * labels.length)],
            mesh.position, this.scene
        );

        if (!this.visitedPlanets.has(name)) {
            this.visitedPlanets.add(name);
            this.score += 100;

            // Sonido de hit
            if (this.sceneManager.audioManager) {
                this.sceneManager.audioManager.playHit();
            }

            // Flash brillante en el planeta
            if (mesh.material) {
                const origEmissive = mesh.material.emissiveColor
                    ? mesh.material.emissiveColor.clone()
                    : new BABYLON.Color3(0, 0, 0);
                mesh.material.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.8);
                setTimeout(() => {
                    if (mesh && mesh.material) mesh.material.emissiveColor = origEmissive;
                }, 350);
            }

            this.sceneManager.uiController.updateArcRotateUI(this);

            // ¡Victoria al visitar los 5 planetas!
            if (this.visitedPlanets.size >= 5 && !this._victoryFired) {
                this._victoryFired = true;
                const bonus = 500;
                this.score += bonus;
                this.sceneManager.uiController.saveRecord('arcRotate', this.score);
                setTimeout(() => {
                    this.sceneManager.uiController.triggerVictory(
                        '¡Has visitado todos los planetas del sistema solar!',
                        this.score,
                        'arcRotate'
                    );
                }, 400);
            }
        }
    }

    triggerPopParticles(position) {
        const ps = new BABYLON.ParticleSystem('planetPop', 25, this.scene);
        ps.particleTexture = AssetLoader.createComicPopTexture(this.scene);
        ps.emitter = position.clone();
        ps.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        ps.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
        ps.color1    = new BABYLON.Color4(1.0, 0.9, 0.2, 1.0);
        ps.colorDead = new BABYLON.Color4(1.0, 0.5, 0.0, 0.0);
        ps.minSize   = 0.8;
        ps.maxSize   = 1.8;
        ps.minLifeTime = 0.25;
        ps.maxLifeTime = 0.5;
        ps.manualEmitCount = 14;
        ps.minEmitPower = 3;
        ps.maxEmitPower = 7;
        ps.direction1 = new BABYLON.Vector3(-1, -1, -1);
        ps.direction2 = new BABYLON.Vector3(1, 1, 1);
        ps.start();
        setTimeout(() => { ps.stop(); ps.dispose(); }, 600);
    }

    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 150 }, this.scene);
        const mat = new BABYLON.StandardMaterial('skyBoxMat', this.scene);
        mat.backFaceCulling = false;
        mat.diffuseTexture  = AssetLoader.createStarsTexture(this.scene);
        mat.specularColor   = BABYLON.Color3.Black();
        mat.disableLighting = true;
        skybox.material     = mat;
        skybox.infiniteDistance = true;
    }

    createSun() {
        this.sun = BABYLON.MeshBuilder.CreateSphere('sun', {
            diameter: this.config.sunSize,
            segments: 36
        }, this.scene);
        this.sun.position = BABYLON.Vector3.Zero();

        const sunMat = new BABYLON.StandardMaterial('sunMat', this.scene);
        sunMat.emissiveTexture = AssetLoader.createSunTexture(this.scene);
        sunMat.disableLighting = true;
        this.sun.material = sunMat;

        const glow = new BABYLON.GlowLayer('sunGlow', this.scene);
        glow.intensity = 0.7;
    }

    updateTimeScale(scale) {
        this.timeScale = scale;
        const el = document.getElementById('val-timescale');
        if (el) el.innerText = `${scale.toFixed(1)}x`;
    }

    update() {
        if (this.sun) {
            this.sun.rotate(BABYLON.Axis.Y, 0.002 * this.timeScale, BABYLON.Space.LOCAL);
        }
        this.planets.forEach(p => p.update(this.timeScale));

        if (this.camera) {
            let targetPos = BABYLON.Vector3.Zero();
            if (this.focusedIndex >= 0 && this.focusedIndex < this.planets.length) {
                const tp = this.planets[this.focusedIndex];
                if (tp && tp.mesh) targetPos = tp.mesh.position;
            }
            this.camera.target = BABYLON.Vector3.Lerp(this.camera.target, targetPos, 0.05);
        }
    }

    dispose() {
        this.planets.forEach(p => p.dispose());
        if (this.sun) this.sun.dispose();
    }
}
