import { CAMERA_CONFIG } from '../config/camera.config.js';

/**
 * Crea e inicializa la FollowCamera.
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.AbstractMesh} targetMesh - El objeto a seguir
 * @returns {BABYLON.FollowCamera}
 */
export function createFollowCamera(scene, targetMesh) {
    const config = CAMERA_CONFIG.follow;
    const camera = new BABYLON.FollowCamera(
        "followCamera",
        new BABYLON.Vector3(0, config.heightOffset, -config.radius),
        scene
    );

    camera.radius = config.radius;
    camera.heightOffset = config.heightOffset;
    camera.rotationOffset = config.rotationOffset;
    camera.cameraAcceleration = config.cameraAcceleration;
    camera.maxCameraSpeed = config.maxCameraSpeed;
    camera.checkCollisions = config.checkCollisions;
    
    if (targetMesh) {
        camera.lockedTarget = targetMesh;
    }

    return camera;
}
