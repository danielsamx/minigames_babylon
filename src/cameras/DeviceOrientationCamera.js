import { CAMERA_CONFIG } from '../config/camera.config.js';

/**
 * Crea e inicializa la DeviceOrientationCamera (giroscopio móvil).
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.DeviceOrientationCamera}
 */
export function createDeviceOrientationCamera(scene) {
    const config = CAMERA_CONFIG.deviceOrientation;
    const position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
    
    const camera = new BABYLON.DeviceOrientationCamera("deviceOrientationCamera", position, scene);
    camera.angularSensibility = config.angularSensibility;
    camera.moveSensibility = config.moveSensibility;
    camera.fov = config.fov;

    // Dirección de vista predeterminada orientada hacia adelante (eje Z positivo)
    camera.setTarget(new BABYLON.Vector3(0, 0, 10));

    return camera;
}
