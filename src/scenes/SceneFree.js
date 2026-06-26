/**
 * Mini-juego: LA GALERÍA PROHIBIDA
 * Cámara FreeCamera - Museo en primera persona con objetos ocultos.
 */
import { AssetLoader }  from '../core/AssetLoader.js';
import { SCENE_CONFIG } from '../config/scene.config.js';

export class SceneFree {
    constructor(scene, cameraManager, sceneManager) {
        this.scene         = scene;
        this.cameraManager = cameraManager;
        this.sceneManager  = sceneManager;

        this.camera       = null;
        this.sculptures   = [];
        this.config       = SCENE_CONFIG.free;
        this.hiddenObjects = [];
        this.foundObjects  = 0;
        this.score         = 0;
        this._startTime    = Date.now();
        this._victoryFired = false;
    }

    async init() {
        // Física y gravedad
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new BABYLON.Vector3(
            this.config.gravity.x,
            this.config.gravity.y,
            this.config.gravity.z
        );

        this.scene.clearColor = new BABYLON.Color4(
            this.config.clearColor.r,
            this.config.clearColor.g,
            this.config.clearColor.b,
            this.config.clearColor.a
        );

        // ── Iluminación realista ─────────────────────────────────────────────
        const ambient = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambient.intensity  = 0.3;
        ambient.diffuse    = new BABYLON.Color3(0.22, 0.22, 0.28);
        ambient.groundColor = new BABYLON.Color3(0.05, 0.05, 0.08);

        const domeLight = new BABYLON.PointLight('domeLight', new BABYLON.Vector3(0, 7, 0), this.scene);
        domeLight.intensity = 0.55;
        domeLight.diffuse   = new BABYLON.Color3(0.95, 0.9, 0.8);
        domeLight.specular  = new BABYLON.Color3(0.8, 0.75, 0.6);

        // ── Cámara ──────────────────────────────────────────────────────────
        this.camera = this.cameraManager.createFreeCamera();

        // ── Galería y exhibits ───────────────────────────────────────────────
        this.buildGallery();
        this.buildMuseumExhibits();
        this.setupHiddenObjects();

        // UI
        this.sceneManager.uiController.setupFreeUI(this);
    }

    buildGallery() {
        const { width, depth, height } = this.config.museumSize;

        // Suelo con baldosas procedurales
        const floor = BABYLON.MeshBuilder.CreateGround('floor', { width, height: depth }, this.scene);
        const floorMat = new BABYLON.StandardMaterial('floorMat', this.scene);
        floorMat.diffuseTexture  = AssetLoader.createMuseumFloorTexture(this.scene);
        floorMat.diffuseTexture.uScale  = 8;
        floorMat.diffuseTexture.vScale  = 8;
        floorMat.specularColor   = new BABYLON.Color3(0.35, 0.32, 0.28);
        floorMat.specularPower   = 22;
        floorMat.disableLighting = false;
        floor.material           = floorMat;
        floor.checkCollisions    = true;

        // Material de paredes: piedra/ladrillo con iluminación
        const wallMat = new BABYLON.StandardMaterial('wallMat', this.scene);
        wallMat.diffuseTexture  = AssetLoader.createHandDrawnBrickTexture(this.scene);
        wallMat.diffuseTexture.uScale  = 6;
        wallMat.diffuseTexture.vScale  = 3;
        wallMat.specularColor   = new BABYLON.Color3(0.06, 0.05, 0.04);
        wallMat.specularPower   = 8;
        wallMat.disableLighting = false;

        const wallConfigs = [
            { name: 'wallBack',  w: width,  h: height, d: 1,     pos: [0, height / 2, depth / 2] },
            { name: 'wallFront', w: width,  h: height, d: 1,     pos: [0, height / 2, -depth / 2] },
            { name: 'wallLeft',  w: 1,      h: height, d: depth,  pos: [-width / 2, height / 2, 0] },
            { name: 'wallRight', w: 1,      h: height, d: depth,  pos: [width / 2, height / 2, 0] },
        ];
        wallConfigs.forEach(wc => {
            const wall = BABYLON.MeshBuilder.CreateBox(wc.name, { width: wc.w, height: wc.h, depth: wc.d }, this.scene);
            wall.position.set(...wc.pos);
            wall.material        = wallMat;
            wall.checkCollisions = true;
        });

        // Luces de neón en el techo
        const drumColors = ['#ef4444', '#3b82f6', '#10b981', '#facc15'];
        for (let i = 0; i < 4; i++) {
            const drum = BABYLON.MeshBuilder.CreateCylinder(`drum_${i}`, { height: 0.28, diameter: 2.1 }, this.scene);
            drum.position.set(-9 + i * 6, height - 0.22, 0);
            const drumMat = new BABYLON.StandardMaterial(`drumMat_${i}`, this.scene);
            drumMat.emissiveColor = BABYLON.Color3.FromHexString(drumColors[i]);
            drumMat.disableLighting = true;
            drum.material = drumMat;
        }

        // Columnas con material de mármol
        const pillarMat = new BABYLON.StandardMaterial('pillarMat', this.scene);
        pillarMat.diffuseColor  = new BABYLON.Color3(0.82, 0.80, 0.76);
        pillarMat.specularColor = new BABYLON.Color3(0.4, 0.38, 0.35);
        pillarMat.specularPower = 18;
        pillarMat.disableLighting = false;

        const pillarPositions = [
            { x: -width / 2 + 1.5, z: -depth / 2 + 1.5 },
            { x:  width / 2 - 1.5, z: -depth / 2 + 1.5 },
            { x: -width / 2 + 1.5, z:  depth / 2 - 1.5 },
            { x:  width / 2 - 1.5, z:  depth / 2 - 1.5 }
        ];
        pillarPositions.forEach((pos, idx) => {
            const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar_${idx}`, { height, diameter: 1.2 }, this.scene);
            pillar.position.set(pos.x, height / 2, pos.z);
            pillar.material        = pillarMat;
            pillar.checkCollisions = true;
        });
    }

    buildMuseumExhibits() {
        this.config.pedestals.forEach((ped, idx) => {
            // Pedestal de mármol oscuro realista
            const pedestal = BABYLON.MeshBuilder.CreateBox(`pedestal_${idx}`, {
                width: 1.6, height: 1.2, depth: 1.6
            }, this.scene);
            pedestal.position.set(ped.x, 0.6, ped.z);
            pedestal.checkCollisions = true;

            const pedestalMat = new BABYLON.StandardMaterial(`pedestalMat_${idx}`, this.scene);
            pedestalMat.diffuseColor  = new BABYLON.Color3(0.1, 0.09, 0.11);
            pedestalMat.specularColor = new BABYLON.Color3(0.6, 0.55, 0.7);
            pedestalMat.specularPower = 55;
            pedestalMat.disableLighting = false;
            pedestal.material = pedestalMat;

            // Escultura con material realista (metal pulido)
            let sculpture;
            const sculptMat = new BABYLON.StandardMaterial(`sculptMat_${idx}`, this.scene);
            const col = BABYLON.Color3.FromHexString(ped.color);
            sculptMat.diffuseColor  = col.scale(0.65);
            sculptMat.specularColor = new BABYLON.Color3(0.9, 0.88, 0.85);
            sculptMat.specularPower = 72;
            sculptMat.ambientColor  = col.scale(0.08);
            sculptMat.emissiveColor = col.scale(0.06);
            sculptMat.disableLighting = false;

            if (ped.type === 'torusKnot') {
                sculpture = BABYLON.MeshBuilder.CreateTorusKnot(`sculpt_${idx}`, {
                    radius: 0.5, tube: 0.15, radialSegments: 64, tubularSegments: 18
                }, this.scene);
            } else if (ped.type === 'crystal') {
                sculpture = BABYLON.MeshBuilder.CreatePolyhedron(`sculpt_${idx}`, {
                    type: 1, size: 0.6
                }, this.scene);
                sculptMat.alpha = 0.82;
                sculptMat.specularPower = 128;
            } else if (ped.type === 'nestedSpheres') {
                sculpture = BABYLON.MeshBuilder.CreateTorus(`sculpt_${idx}`, {
                    diameter: 1.0, thickness: 0.12
                }, this.scene);
                const inner = BABYLON.MeshBuilder.CreateSphere(`sculptInner_${idx}`, { diameter: 0.5 }, this.scene);
                inner.parent = sculpture;
                const innerMat = new BABYLON.StandardMaterial(`innerMat_${idx}`, this.scene);
                innerMat.diffuseColor  = new BABYLON.Color3(0.92, 0.92, 0.96);
                innerMat.specularColor = new BABYLON.Color3(1, 1, 1);
                innerMat.specularPower = 90;
                innerMat.disableLighting = false;
                inner.material = innerMat;
            } else {
                sculpture = BABYLON.MeshBuilder.CreateBox(`sculpt_${idx}`, { size: 0.8 }, this.scene);
            }

            sculpture.position.set(ped.x, 1.9, ped.z);
            sculpture.material        = sculptMat;
            sculpture.checkCollisions = true;

            this.sculptures.push({ mesh: sculpture, type: ped.type, baseY: 1.9, phase: Math.random() * Math.PI });

            // Foco de color sobre la escultura
            const spot = new BABYLON.SpotLight(
                `spot_${idx}`,
                new BABYLON.Vector3(ped.x, 6, ped.z),
                new BABYLON.Vector3(0, -1, 0),
                Math.PI / 3.5, 2, this.scene
            );
            spot.intensity = 1.6;
            spot.diffuse   = col;
            spot.specular  = new BABYLON.Color3(0.8, 0.8, 0.8);
        });
    }

    setupHiddenObjects() {
        for (let i = 0; i < 5; i++) {
            const mesh = BABYLON.MeshBuilder.CreateSphere(`hidden_${i}`, { diameter: 0.55 }, this.scene);
            const x = (Math.random() - 0.5) * this.config.museumSize.width * 0.78;
            const z = (Math.random() - 0.5) * this.config.museumSize.depth * 0.78;
            mesh.position = new BABYLON.Vector3(x, 1.0, z);

            // Material dorado brillante realista
            const mat = new BABYLON.StandardMaterial(`hiddenMat_${i}`, this.scene);
            mat.diffuseColor  = new BABYLON.Color3(0.85, 0.62, 0.02);
            mat.specularColor = new BABYLON.Color3(1.0, 0.9, 0.4);
            mat.specularPower = 80;
            mat.emissiveColor = new BABYLON.Color3(0.18, 0.12, 0.0);
            mat.alpha         = 0.65;
            mat.disableLighting = false;
            mesh.material       = mat;
            mesh.checkCollisions = true;
            mesh.metadata = { found: false };
            this.hiddenObjects.push(mesh);
        }
    }

    checkHiddenObjects() {
        if (!this.camera) return;
        this.hiddenObjects.forEach(obj => {
            if (obj.metadata && obj.metadata.found) return;
            const dist = BABYLON.Vector3.Distance(this.camera.position, obj.position);
            if (dist < 1.5) {
                obj.metadata.found = true;
                obj.isVisible      = false;
                this.foundObjects += 1;
                this.score        += 200;

                // Sonido
                if (this.sceneManager.audioManager) {
                    this.sceneManager.audioManager.playCollect();
                }

                this.sceneManager.uiController.showFloatingBubbleAt3D('¡ENCONTRADO!', obj.position, this.scene);
                this.sceneManager.uiController.updateFreeUI(this);

                // Victoria al encontrar los 5
                if (this.foundObjects >= 5 && !this._victoryFired) {
                    this._victoryFired = true;
                    const elapsed  = Math.floor((Date.now() - this._startTime) / 1000);
                    const timeBonus = Math.max(0, 300 - elapsed * 2);
                    this.score += timeBonus;
                    this.sceneManager.uiController.saveRecord('free', this.score);
                    setTimeout(() => {
                        this.sceneManager.uiController.triggerVictory(
                            `¡Los 5 objetos encontrados en ${elapsed}s! (+${timeBonus} pts bonus)`,
                            this.score,
                            'free'
                        );
                    }, 500);
                }
            }
        });
    }

    update() {
        if (this.camera) {
            const xEl = document.getElementById('val-x');
            const zEl = document.getElementById('val-z');
            if (xEl) xEl.innerText = this.camera.position.x.toFixed(2);
            if (zEl) zEl.innerText = this.camera.position.z.toFixed(2);
            this.checkHiddenObjects();
        }

        const time = Date.now() * 0.001;
        this.sculptures.forEach(sc => {
            if (!sc.mesh) return;
            sc.mesh.rotate(BABYLON.Axis.Y, 0.014, BABYLON.Space.LOCAL);
            sc.mesh.rotate(BABYLON.Axis.X, 0.004, BABYLON.Space.LOCAL);
            const offset = Math.sin(time * 1.4 + sc.phase) * 0.11;
            sc.mesh.position.y = sc.baseY + offset;
        });
    }

    dispose() {
        this.sculptures.forEach(sc => { if (sc.mesh) sc.mesh.dispose(); });
    }
}
