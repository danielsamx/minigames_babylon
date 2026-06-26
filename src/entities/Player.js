/**
 * Nave espacial del jugador en "Piloto de Estrellas" (FollowCamera).
 * Material metálico realista con iluminación habilitada.
 */
export class Player {
    /**
     * @param {BABYLON.Scene} scene
     */
    constructor(scene) {
        this.scene  = scene;
        this.mesh   = null;
        this.particleSystem = null;

        this.speed     = 10;
        this.turnSpeed = 2.5;
        this.input = { left: 0, right: 0, up: 0, down: 0 };

        this.create();
    }

    create() {
        // Nodo raíz de la nave
        this.mesh = new BABYLON.TransformNode('playerNode', this.scene);

        // ── Fuselaje principal (cono elongado) ──────────────────────────────
        const body = BABYLON.MeshBuilder.CreateCylinder('shipBody', {
            height: 3.2,
            diameterTop: 0.05,
            diameterBottom: 1.15,
            tessellation: 20
        }, this.scene);
        body.rotation.x = Math.PI / 2;
        body.parent = this.mesh;

        // ── Alas ────────────────────────────────────────────────────────────
        const wingL = BABYLON.MeshBuilder.CreateBox('wingL', { width: 2.2, height: 0.08, depth: 0.9 }, this.scene);
        wingL.position.set(-1.25, -0.15, -0.6);
        wingL.rotation.y = Math.PI / 11;
        wingL.rotation.z = -0.12;
        wingL.parent = this.mesh;

        const wingR = BABYLON.MeshBuilder.CreateBox('wingR', { width: 2.2, height: 0.08, depth: 0.9 }, this.scene);
        wingR.position.set(1.25, -0.15, -0.6);
        wingR.rotation.y = -Math.PI / 11;
        wingR.rotation.z = 0.12;
        wingR.parent = this.mesh;

        // ── Cabina (domo) ─────────────────────────────────────────────────
        const cockpit = BABYLON.MeshBuilder.CreateSphere('cockpit', { diameter: 0.65, segments: 10 }, this.scene);
        cockpit.scaling.z = 0.7;
        cockpit.position.set(0, 0.22, 0.6);
        cockpit.parent = this.mesh;

        // ── Motor/Turbina ─────────────────────────────────────────────────
        const engine = BABYLON.MeshBuilder.CreateCylinder('engine', { height: 0.65, diameter: 0.62 }, this.scene);
        engine.rotation.x = Math.PI / 2;
        engine.position.set(0, 0, -1.55);
        engine.parent = this.mesh;

        // ── Materiales REALISTAS ──────────────────────────────────────────

        // Fuselaje: metal azul oscuro con especular brillante
        const bodyMat = new BABYLON.StandardMaterial('shipBodyMat', this.scene);
        bodyMat.diffuseColor  = new BABYLON.Color3(0.05, 0.12, 0.35);
        bodyMat.specularColor = new BABYLON.Color3(0.6, 0.7, 1.0);
        bodyMat.specularPower = 64;
        bodyMat.ambientColor  = new BABYLON.Color3(0.02, 0.05, 0.12);
        bodyMat.emissiveColor = new BABYLON.Color3(0.02, 0.05, 0.18);
        bodyMat.disableLighting = false;
        body.material = bodyMat;

        // Alas: titanio gris oscuro
        const wingsMat = new BABYLON.StandardMaterial('shipWingsMat', this.scene);
        wingsMat.diffuseColor  = new BABYLON.Color3(0.12, 0.13, 0.16);
        wingsMat.specularColor = new BABYLON.Color3(0.5, 0.55, 0.65);
        wingsMat.specularPower = 48;
        wingsMat.ambientColor  = new BABYLON.Color3(0.03, 0.03, 0.04);
        wingsMat.disableLighting = false;
        wingL.material = wingsMat;
        wingR.material = wingsMat;

        // Cabina: cristal azul con algo de transparencia
        const cockpitMat = new BABYLON.StandardMaterial('cockpitMat', this.scene);
        cockpitMat.diffuseColor  = new BABYLON.Color3(0.1, 0.3, 0.7);
        cockpitMat.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        cockpitMat.specularPower = 128;
        cockpitMat.emissiveColor = new BABYLON.Color3(0.02, 0.08, 0.25);
        cockpitMat.alpha = 0.75;
        cockpitMat.disableLighting = false;
        cockpit.material = cockpitMat;

        // Motor: naranja brillante (plasma)
        const engineMat = new BABYLON.StandardMaterial('engineMat', this.scene);
        engineMat.diffuseColor  = new BABYLON.Color3(0.6, 0.25, 0.02);
        engineMat.emissiveColor = new BABYLON.Color3(0.9, 0.42, 0.05);
        engineMat.specularColor = new BABYLON.Color3(1.0, 0.6, 0.1);
        engineMat.specularPower = 32;
        engineMat.disableLighting = false;
        engine.material = engineMat;

        // Contornos de fuselaje
        [body, wingL, wingR].forEach(m => {
            m.renderOutline = true;
            m.outlineColor  = new BABYLON.Color3(0.15, 0.2, 0.5);
            m.outlineWidth  = 0.05;
        });

        // Partículas del propulsor
        this.createThrusterParticles(engine);

        // Controles de teclado
        this.setupControls();
    }

    createThrusterParticles(emitter) {
        this.particleSystem = new BABYLON.ParticleSystem('thrusterParticles', 120, this.scene);

        import('../core/AssetLoader.js').then(module => {
            if (this.particleSystem) {
                this.particleSystem.particleTexture = module.AssetLoader.createComicPuffTexture(this.scene);
            }
        });

        this.particleSystem.emitter = emitter;
        this.particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
        this.particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);

        // Llama del propulsor: azul → blanco → naranja
        this.particleSystem.color1    = new BABYLON.Color4(0.5, 0.7, 1.0, 1.0);
        this.particleSystem.color2    = new BABYLON.Color4(1.0, 0.9, 0.5, 0.9);
        this.particleSystem.colorDead = new BABYLON.Color4(1.0, 0.4, 0.0, 0.0);

        this.particleSystem.minSize    = 0.18;
        this.particleSystem.maxSize    = 0.55;
        this.particleSystem.minLifeTime = 0.12;
        this.particleSystem.maxLifeTime = 0.38;
        this.particleSystem.emitRate   = 60;
        this.particleSystem.direction1 = new BABYLON.Vector3(0, 0, -1);
        this.particleSystem.direction2 = new BABYLON.Vector3(0, 0, -1.3);
        this.particleSystem.minEmitPower = 5;
        this.particleSystem.maxEmitPower = 9;
        this.particleSystem.updateSpeed  = 0.01;

        this.particleSystem.start();
    }

    setupControls() {
        this.onKeyDown = (e) => {
            if (e.keyCode === 37 || e.keyCode === 65)  this.input.left  = 1;
            if (e.keyCode === 39 || e.keyCode === 68)  this.input.right = 1;
            if (e.keyCode === 38 || e.keyCode === 87)  this.input.up    = 1;
            if (e.keyCode === 40 || e.keyCode === 83)  this.input.down  = 1;
        };
        this.onKeyUp = (e) => {
            if (e.keyCode === 37 || e.keyCode === 65)  this.input.left  = 0;
            if (e.keyCode === 39 || e.keyCode === 68)  this.input.right = 0;
            if (e.keyCode === 38 || e.keyCode === 87)  this.input.up    = 0;
            if (e.keyCode === 40 || e.keyCode === 83)  this.input.down  = 0;
        };
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup',   this.onKeyUp);
    }

    update(deltaTime) {
        if (!this.mesh) return;

        // Avance continuo
        this.mesh.translate(BABYLON.Axis.Z, this.speed * deltaTime, BABYLON.Space.LOCAL);

        let yaw = 0, pitch = 0, roll = 0;
        if (this.input.left)  { yaw = -this.turnSpeed * deltaTime; roll =  0.38; }
        else if (this.input.right) { yaw =  this.turnSpeed * deltaTime; roll = -0.38; }
        if (this.input.up)    pitch = -this.turnSpeed * deltaTime;
        else if (this.input.down)  pitch =  this.turnSpeed * deltaTime;

        this.mesh.rotate(BABYLON.Axis.Y, yaw,   BABYLON.Space.LOCAL);
        this.mesh.rotate(BABYLON.Axis.X, pitch, BABYLON.Space.LOCAL);

        const shipBodyNode = this.mesh.getChildren()[0];
        if (shipBodyNode) {
            shipBodyNode.rotation.y = BABYLON.Scalar.Lerp(shipBodyNode.rotation.y, roll, 0.1);
        }
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup',   this.onKeyUp);
        if (this.particleSystem) {
            this.particleSystem.stop();
            this.particleSystem.dispose();
        }
        if (this.mesh) this.mesh.dispose();
    }
}
