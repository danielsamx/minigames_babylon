import { CAMERA_CONFIG } from '../config/camera.config.js';

/**
 * Crea e inicializa la AnaglyphArcRotateCamera para visualización en 3D estereoscópico.
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.AnaglyphArcRotateCamera}
 */
export function createAnaglyphCamera(scene) {
    const config = CAMERA_CONFIG.anaglyph;
    const target = new BABYLON.Vector3(config.target.x, config.target.y, config.target.z);
    
    const camera = new BABYLON.AnaglyphArcRotateCamera(
        "anaglyphCamera",
        config.alpha,
        config.beta,
        config.radius,
        target,
        config.eyeSpace,
        scene
    );

    camera.lowerRadiusLimit = config.lowerRadiusLimit;
    camera.upperRadiusLimit = config.upperRadiusLimit;

    return camera;
}
