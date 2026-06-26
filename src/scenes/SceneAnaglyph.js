/**
 * Mini-juego: EL LABERINTO DEL TIEMPO
 * Cámara AnaglyphArcRotateCamera - Laberinto 3D estereoscópico con cronómetro.
 */
import { AssetLoader }  from '../core/AssetLoader.js';
import { SCENE_CONFIG } from '../config/scene.config.js';

export class SceneAnaglyph {
    constructor(scene, cameraManager, sceneManager) {
        this.scene         = scene;
        this.cameraManager = cameraManager;
        this.sceneManager  = sceneManager;

        this.camera       = null;
        this.blocks       = [];
        this.config       = SCENE_CONFIG.anaglyph;
        this.playerSphere = null;
        this.goalMesh     = null;
        this.stardust     = null;
        this.skybox       = null;

        // Estado del juego
        this.timeLeft     = 60.0;
        this.gameWon      = false;
        this.gameOver     = false;
        this.score        = 0;
        this.keys         = { w: 0, a: 0, s: 0, d: 0 };

        this._tickSoundTimer = 0;
    }

    async init() {
        this.scene.collisionsEnabled = true;
        this.scene.clearColor = new BABYLON.Color4(
            this.config.clearColor.r,
            this.config.clearColor.g,
            this.config.clearColor.b,
            this.config.clearColor.a
        );

        // ── Iluminación realista ─────────────────────────────────────────────
        const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambient.intensity = 0.22;
        ambient.diffuse   = new BABYLON.Color3(0.22, 0.12, 0.35);

        // Luz de punto central para dar relieve a los bloques
        const centerLight = new BABYLON.PointLight('centerLight', new BABYLON.Vector3(0, 5, 0), this.scene);
        centerLight.intensity = 0.8;
        centerLight.diffuse   = new BABYLON.Color3(0.4, 0.2, 0.8);
        centerLight.range     = 30;

        // ── Cámara Anaglyph ──────────────────────────────────────────────────
        this.camera = this.cameraManager.createAnaglyphCamera();

        // ── Suelo, skybox, laberinto, personaje, meta ───────────────────────
        this.createGridFloor();
        this.createSkybox();
        this.buildNeonMaze();
        this.createPlayerSphere();
        this.createGoalPortal();
        this.createStardustParticles();

        // UI + controles
        this.sceneManager.uiController.setupAnaglyphUI(this);
        this.setupKeyboardControls();
    }

    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateSphere('anaglyphSky', { diameter: 450, segments: 16 }, this.scene);
        const mat    = new BABYLON.StandardMaterial('anaglyphSkyMat', this.scene);
        mat.backFaceCulling = false;
        mat.emissiveTexture = AssetLoader.createNebulaTexture(this.scene);
        mat.disableLighting = true;
        skybox.material       = mat;
        skybox.infiniteDistance = true;
        this.skybox = skybox;
    }

    createGridFloor() {
        const floor = BABYLON.MeshBuilder.CreateGround('gridFloor', { width: 60, height: 60 }, this.scene);
        const mat   = new BABYLON.StandardMaterial('floorGridMat', this.scene);
        mat.diffuseTexture = AssetLoader.createNeonGridTexture('#d946ef', this.scene);
        mat.diffuseTexture.uScale  = 12;
        mat.diffuseTexture.vScale  = 12;
        mat.specularColor   = new BABYLON.Color3(0.15, 0.05, 0.2);
        mat.specularPower   = 18;
        mat.disableLighting = false;
        floor.material      = mat;
        floor.position.y    = -1.0;
    }

    buildNeonMaze() {
        const mazeLayout = [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [1,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ];

        const blockSize = 2.0;
        const halfSize  = (this.config.mazeSize * blockSize) / 2;

        // Material Cian realista
        const cyanMat = new BABYLON.StandardMaterial('neonCyanMat', this.scene);
        cyanMat.diffuseColor  = new BABYLON.Color3(
            this.config.neonCyan.r * 0.5,
            this.config.neonCyan.g * 0.5,
            this.config.neonCyan.b * 0.5
        );
        cyanMat.emissiveColor = new BABYLON.Color3(
            this.config.neonCyan.r * 0.45,
            this.config.neonCyan.g * 0.45,
            this.config.neonCyan.b * 0.45
        );
        cyanMat.specularColor = new BABYLON.Color3(0.5, 1.0, 1.0);
        cyanMat.specularPower = 40;
        cyanMat.disableLighting = false;

        // Material Rojo realista
        const redMat = new BABYLON.StandardMaterial('neonRedMat', this.scene);
        redMat.diffuseColor  = new BABYLON.Color3(
            this.config.neonRed.r * 0.5,
            this.config.neonRed.g * 0.1,
            this.config.neonRed.b * 0.1
        );
        redMat.emissiveColor = new BABYLON.Color3(
            this.config.neonRed.r * 0.4,
            this.config.neonRed.g * 0.05,
            this.config.neonRed.b * 0.05
        );
        redMat.specularColor = new BABYLON.Color3(1.0, 0.3, 0.3);
        redMat.specularPower = 40;
        redMat.disableLighting = false;

        for (let row = 0; row < this.config.mazeSize; row++) {
            for (let col = 0; col < this.config.mazeSize; col++) {
                if (mazeLayout[row][col] === 1) {
                    const block = BABYLON.MeshBuilder.CreateBox(`block_${row}_${col}`, {
                        size: blockSize * 0.95
                    }, this.scene);
                    const x = col * blockSize - halfSize + blockSize / 2;
                    const z = row * blockSize - halfSize + blockSize / 2;
                    block.position.set(x, 0, z);
                    block.material       = (row + col) % 2 === 0 ? cyanMat : redMat;
                    block.checkCollisions = true;
                    this.blocks.push({ mesh: block, originalY: 0, offsetPhase: Math.random() * Math.PI });
                }
            }
        }
    }

    createPlayerSphere() {
        this.playerSphere = BABYLON.MeshBuilder.CreateSphere('heroSphere', { diameter: 0.82, segments: 18 }, this.scene);
        this.playerSphere.position.set(-7.0, 0.0, -7.0);
        this.playerSphere.checkCollisions = true;

        // Material esfera héroe: metal dorado
        const heroMat = new BABYLON.StandardMaterial('heroSphereMat', this.scene);
        heroMat.diffuseColor  = new BABYLON.Color3(0.75, 0.55, 0.0);
        heroMat.specularColor = new BABYLON.Color3(1.0, 0.95, 0.5);
        heroMat.specularPower = 90;
        heroMat.emissiveColor = new BABYLON.Color3(0.08, 0.05, 0.0);
        heroMat.disableLighting = false;
        this.playerSphere.material = heroMat;

        this.playerSphere.renderOutline = true;
        this.playerSphere.outlineColor  = new BABYLON.Color3(1.0, 0.8, 0.0);
        this.playerSphere.outlineWidth  = 0.04;
    }

    createGoalPortal() {
        this.goalMesh = BABYLON.MeshBuilder.CreateTorusKnot('goalPortal', { radius: 0.38, tube: 0.13 }, this.scene);
        this.goalMesh.position.set(7.0, 0.0, 7.0);

        const goalMat = new BABYLON.StandardMaterial('goalPortalMat', this.scene);
        goalMat.diffuseColor  = new BABYLON.Color3(0.05, 0.5, 0.08);
        goalMat.emissiveColor = new BABYLON.Color3(0.04, 0.55, 0.06);
        goalMat.specularColor = new BABYLON.Color3(0.6, 1.0, 0.6);
        goalMat.specularPower = 60;
        goalMat.disableLighting = false;
        this.goalMesh.material = goalMat;

        this.goalMesh.renderOutline = true;
        this.goalMesh.outlineColor  = new BABYLON.Color3(0.0, 1.0, 0.2);
        this.goalMesh.outlineWidth  = 0.04;
    }

    createStardustParticles() {
        this.stardust = new BABYLON.ParticleSystem('stardustParticles', 120, this.scene);
        this.stardust.particleTexture = new BABYLON.Texture(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR42u3WsQ0AIAwEsfa/dGzBCG6gkDrpEzgnWdpa5T3X9wEAAAAAAAAAAAAAAAAAAADgqG+AW/0FAAAAAAAAAAAAAAAAAAAAAADA2wAdgA7w3QMAAAAAAAAAAAAAAAAAAAAAAPB2gA5AB6gHAAAAAElFTkSuQmCC',
            this.scene, false, false
        );
        this.stardust.emitter    = new BABYLON.Vector3(0, 0, 0);
        this.stardust.minEmitBox = new BABYLON.Vector3(-15, -4, -15);
        this.stardust.maxEmitBox = new BABYLON.Vector3(15, 4, 15);
        this.stardust.color1    = new BABYLON.Color4(0.8, 0.5, 1.0, 1.0);
        this.stardust.color2    = new BABYLON.Color4(0.5, 0.1, 0.8, 0.6);
        this.stardust.colorDead = new BABYLON.Color4(0.2, 0.0, 0.2, 0.0);
        this.stardust.minSize   = 0.1;
        this.stardust.maxSize   = 0.32;
        this.stardust.minLifeTime = 2.0;
        this.stardust.maxLifeTime = 4.5;
        this.stardust.emitRate  = 22;
        this.stardust.direction1 = new BABYLON.Vector3(-0.2, -0.05, -0.2);
        this.stardust.direction2 = new BABYLON.Vector3(0.2, 0.05, 0.2);
        this.stardust.minEmitPower = 0.1;
        this.stardust.maxEmitPower = 0.45;
        this.stardust.start();
    }

    setupKeyboardControls() {
        this.onKeyDown = (e) => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp')    this.keys.w = 1;
            if (k === 's' || e.key === 'ArrowDown')  this.keys.s = 1;
            if (k === 'a' || e.key === 'ArrowLeft')  this.keys.a = 1;
            if (k === 'd' || e.key === 'ArrowRight') this.keys.d = 1;
        };
        this.onKeyUp = (e) => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp')    this.keys.w = 0;
            if (k === 's' || e.key === 'ArrowDown')  this.keys.s = 0;
            if (k === 'a' || e.key === 'ArrowLeft')  this.keys.a = 0;
            if (k === 'd' || e.key === 'ArrowRight') this.keys.d = 0;
        };
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup',   this.onKeyUp);
    }

    update() {
        const engine    = this.scene.getEngine();
        const deltaTime = engine.getDeltaTime() * 0.001;
        const time      = Date.now() * 0.001;

        // Skybox
        if (this.skybox) {
            this.skybox.rotate(BABYLON.Axis.Y, 0.0002 * deltaTime * 60, BABYLON.Space.LOCAL);
        }

        // Animar bloques
        this.blocks.forEach(block => {
            const offset = Math.sin(time * 1.0 + block.offsetPhase) * 0.12;
            block.mesh.position.y = block.originalY + offset;
            block.mesh.rotation.y = offset * 0.18;
        });

        // Animar meta
        if (this.goalMesh) {
            this.goalMesh.rotate(BABYLON.Axis.Y, 0.022, BABYLON.Space.LOCAL);
            this.goalMesh.rotate(BABYLON.Axis.Z, 0.009, BABYLON.Space.LOCAL);
        }

        if (this.gameWon || this.gameOver) return;

        // Mover esfera
        if (this.playerSphere) {
            const speed    = 5.0 * deltaTime;
            const velocity = new BABYLON.Vector3(0, 0, 0);
            if (this.keys.w) velocity.z =  speed;
            if (this.keys.s) velocity.z = -speed;
            if (this.keys.a) velocity.x = -speed;
            if (this.keys.d) velocity.x =  speed;
            if (velocity.length() > 0) this.playerSphere.moveWithCollisions(velocity);
            this.playerSphere.position.y = 0.0;
        }

        // Cronómetro
        this.timeLeft -= deltaTime;
        this._tickSoundTimer += deltaTime;

        // Tick sonoro cada segundo cuando queda menos de 10s
        if (this.timeLeft <= 10 && this._tickSoundTimer >= 1.0) {
            this._tickSoundTimer = 0;
            if (this.sceneManager.audioManager) {
                this.sceneManager.audioManager.playTick();
            }
        }

        if (this.timeLeft <= 0) {
            this.gameOver  = true;
            this.timeLeft  = 0;
            this.sceneManager.uiController.triggerGameOver(
                '¡El tiempo se ha agotado! No llegaste a la salida.',
                this.score,
                'anaglyph'
            );
        }

        // Colisión con la meta
        if (this.playerSphere && this.goalMesh) {
            const dist = BABYLON.Vector3.Distance(this.playerSphere.position, this.goalMesh.position);
            if (dist < 1.0) {
                this.gameWon = true;
                // Puntuación: tiempo restante × 10
                this.score = Math.floor(this.timeLeft * 10);
                this.sceneManager.uiController.saveRecord('anaglyph', this.score);
                this.sceneManager.uiController.triggerVictory(
                    `¡Laberinto superado! Tiempo restante: ${Math.ceil(this.timeLeft)}s`,
                    this.score,
                    'anaglyph'
                );
            }
        }

        this.sceneManager.uiController.updateAnaglyphUI(this);
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup',   this.onKeyUp);
        if (this.stardust)     { this.stardust.stop();    this.stardust.dispose(); }
        if (this.playerSphere) this.playerSphere.dispose();
        if (this.goalMesh)     this.goalMesh.dispose();
        if (this.skybox)       this.skybox.dispose();
        this.blocks.forEach(b => b.mesh.dispose());
        this.sceneManager.uiController.stopConfetti();
    }
}
