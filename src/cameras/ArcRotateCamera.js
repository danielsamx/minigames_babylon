import { CAMERA_CONFIG } from '../config/camera.config.js';

/**
 * Crea e inicializa la ArcRotateCamera.
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.ArcRotateCamera}
 */
export function createArcRotateCamera(scene) {
    const config = CAMERA_CONFIG.arcRotate;
    const target = new BABYLON.Vector3(config.target.x, config.target.y, config.target.z);
    
    const camera = new BABYLON.ArcRotateCamera(
        "arcRotateCamera",
        config.alpha,
        config.beta,
        config.radius,
        target,
        scene
    );

    camera.lowerRadiusLimit = config.lowerRadiusLimit;
    camera.upperRadiusLimit = config.upperRadiusLimit;
    camera.lowerBetaLimit = config.lowerBetaLimit;
    camera.upperBetaLimit = config.upperBetaLimit;
    camera.wheelPrecision = config.wheelPrecision;
    camera.panningSensibility = config.panningSensibility;
    camera.inertia = config.inertia;

    return camera;
}
