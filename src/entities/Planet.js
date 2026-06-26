/**
 * Clase que representa un planeta en el Sistema Solar.
 */
import { AssetLoader } from '../core/AssetLoader.js';

export class Planet {
    /**
     * @param {string} name - Nombre del planeta
     * @param {number} size - Diámetro del planeta
     * @param {number} orbitRadius - Distancia al Sol
     * @param {number} speed - Velocidad orbital de revolución
     * @param {BABYLON.Scene} scene - Escena contenedora
     */
    constructor(name, size, orbitRadius, speed, scene) {
        this.name = name;
        this.size = size;
        this.orbitRadius = orbitRadius;
        this.speed = speed;
        this.scene = scene;
        this.angle = Math.random() * Math.PI * 2; // Ángulo orbital inicial aleatorio
        this.rotationSpeed = 0.01 + Math.random() * 0.02; // Velocidad de rotación sobre su propio eje

        this.mesh = null;
        this.orbitLine = null;

        this.create();
    }

    create() {
        // Crear la esfera física del planeta (más segmentos para mejor iluminación)
        this.mesh = BABYLON.MeshBuilder.CreateSphere(this.name, { diameter: this.size, segments: 40 }, this.scene);

        // ── Material REALISTA con iluminación ─────────────────────────────────
        const material = new BABYLON.StandardMaterial(`${this.name}Mat`, this.scene);
        const texture  = AssetLoader.createPlanetTexture(this.name, this.scene);

        // Textura como diffuse (reacciona a la luz solar)
        material.diffuseTexture  = texture;

        // Colores especulares y ambientes por planeta para mayor realismo
        const planetProps = {
            mercury: { spec: new BABYLON.Color3(0.22, 0.20, 0.18), specPow: 12,  emissive: new BABYLON.Color3(0.02, 0.02, 0.02) },
            venus:   { spec: new BABYLON.Color3(0.28, 0.26, 0.18), specPow: 8,   emissive: new BABYLON.Color3(0.04, 0.03, 0.01) },
            earth:   { spec: new BABYLON.Color3(0.20, 0.28, 0.38), specPow: 22,  emissive: new BABYLON.Color3(0.01, 0.02, 0.05) },
            mars:    { spec: new BABYLON.Color3(0.28, 0.14, 0.10), specPow: 10,  emissive: new BABYLON.Color3(0.04, 0.01, 0.01) },
            jupiter: { spec: new BABYLON.Color3(0.30, 0.25, 0.18), specPow: 6,   emissive: new BABYLON.Color3(0.04, 0.03, 0.01) }
        };
        const props = planetProps[this.name] || {
            spec: new BABYLON.Color3(0.2, 0.2, 0.2), specPow: 10, emissive: new BABYLON.Color3(0, 0, 0)
        };
        material.specularColor   = props.spec;
        material.specularPower   = props.specPow;
        material.emissiveColor   = props.emissive;
        material.ambientColor    = new BABYLON.Color3(0.04, 0.04, 0.06);
        material.disableLighting = false; // Iluminación REAL habilitada

        this.mesh.material = material;

        // Trazar línea de órbita para ayuda visual
        this.drawOrbitLine();

        // Posicionamiento inicial en su órbita
        this.updatePosition();
    }

    drawOrbitLine() {
        const points = [];
        const segments = 120;
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new BABYLON.Vector3(Math.cos(theta) * this.orbitRadius, 0, Math.sin(theta) * this.orbitRadius));
        }

        this.orbitLine = BABYLON.MeshBuilder.CreateLines(`${this.name}Orbit`, {
            points: points,
            updatable: false
        }, this.scene);

        // Hacer la línea sutil y semitransparente
        this.orbitLine.color = new BABYLON.Color3(0.2, 0.2, 0.3);
    }

    updatePosition() {
        if (!this.mesh) return;

        // Calcular nueva posición trigonométrica en el plano XZ
        const x = Math.cos(this.angle) * this.orbitRadius;
        const z = Math.sin(this.angle) * this.orbitRadius;
        
        this.mesh.position.set(x, 0, z);
    }

    /**
     * Actualiza la órbita y rotación del planeta.
     * @param {number} timeScale - Factor para acelerar o pausar la velocidad
     */
    update(timeScale = 1.0) {
        // Avanzar el ángulo orbital
        this.angle += this.speed * timeScale;
        this.updatePosition();

        // Rotar el planeta sobre sí mismo
        if (this.mesh) {
            this.mesh.rotate(BABYLON.Axis.Y, this.rotationSpeed * timeScale, BABYLON.Space.LOCAL);
        }
    }

    /**
     * Limpia los recursos creados.
     */
    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.orbitLine) {
            this.orbitLine.dispose();
        }
    }
}
