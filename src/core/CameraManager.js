/**
 * Gestor de cámaras de la escena activa.
 * Delega la creación de cámaras a sus respectivos archivos de implementación modular.
 */
import { createArcRotateCamera } from '../cameras/ArcRotateCamera.js';
import { createFreeCamera } from '../cameras/FreeCamera.js';
import { createFollowCamera } from '../cameras/FollowCamera.js';
import { createAnaglyphCamera } from '../cameras/AnaglyphCamera.js';
import { createDeviceOrientationCamera } from '../cameras/DeviceOrientationCamera.js';

export class CameraManager {
    constructor(scene) {
        this.scene = scene;
        this.activeCamera = null;
    }

    createArcRotateCamera() {
        this.activeCamera = createArcRotateCamera(this.scene);
        return this.activeCamera;
    }

    createFreeCamera() {
        this.activeCamera = createFreeCamera(this.scene);
        return this.activeCamera;
    }

    createFollowCamera(targetMesh) {
        this.activeCamera = createFollowCamera(this.scene, targetMesh);
        return this.activeCamera;
    }

    createAnaglyphCamera() {
        this.activeCamera = createAnaglyphCamera(this.scene);
        return this.activeCamera;
    }

    createDeviceOrientationCamera() {
        this.activeCamera = createDeviceOrientationCamera(this.scene);
        return this.activeCamera;
    }

    /**
     * Vincula la cámara activa con el lienzo para recibir entradas del usuario.
     * @param {HTMLCanvasElement} canvas
     */
    attachActiveCamera(canvas) {
        if (this.activeCamera) {
            this.scene.activeCamera = this.activeCamera;
            // attachControl permite a Babylon manejar interacciones nativas de teclado/ratón/gestos
            this.activeCamera.attachControl(canvas, true);
        }
    }

    /**
     * Desvincula controles del canvas de la cámara activa.
     */
    detachActiveCamera() {
        if (this.activeCamera) {
            this.activeCamera.detachControl();
        }
    }
}
