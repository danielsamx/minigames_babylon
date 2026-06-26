import { CAMERA_CONFIG } from '../config/camera.config.js';

/**
 * Crea e inicializa la FreeCamera con colisiones y gravedad.
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.FreeCamera}
 */
export function createFreeCamera(scene) {
    const config = CAMERA_CONFIG.free;
    const position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
    
    const camera = new BABYLON.FreeCamera("freeCamera", position, scene);
    
    // Asignación de controles por teclado
    camera.keysUp = config.keysUp;
    camera.keysDown = config.keysDown;
    camera.keysLeft = config.keysLeft;
    camera.keysRight = config.keysRight;
    
    camera.speed = config.speed;
    camera.angularSensibility = config.angularSensibility;
    camera.inertia = config.inertia;

    // Configurar física del cuerpo
    camera.checkCollisions = config.checkCollisions;
    camera.applyGravity = config.applyGravity;
    camera.ellipsoid = new BABYLON.Vector3(config.ellipsoid.x, config.ellipsoid.y, config.ellipsoid.z);

    return camera;
}
