/**
 * Controlador de eventos para el selector superior de cámaras y escenas.
 */
import { SceneArcRotate } from '../scenes/SceneArcRotate.js';
import { SceneFree } from '../scenes/SceneFree.js';
import { SceneFollow } from '../scenes/SceneFollow.js';
import { SceneAnaglyph } from '../scenes/SceneAnaglyph.js';
import { SceneDeviceOrientation } from '../scenes/SceneDeviceOrientation.js';

export class CameraSwitcher {
    /**
     * @param {SceneManager} sceneManager
     */
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.buttons = document.querySelectorAll('.camera-btn[data-camera]');
        
        // Mapeo entre claves de botones HTML y clases constructoras de escena
        this.sceneMapping = {
            arcRotate: SceneArcRotate,
            free: SceneFree,
            follow: SceneFollow,
            anaglyph: SceneAnaglyph,
            deviceOrientation: SceneDeviceOrientation
        };

        this.init();
    }

    init() {
        this.buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                const cameraKey = targetBtn.getAttribute('data-camera');
                
                // Si la escena seleccionada ya está activa, no hacer nada
                if (targetBtn.classList.contains('active')) return;

                // Alternar clase activa en los botones superiores
                this.buttons.forEach(b => b.classList.remove('active'));
                targetBtn.classList.add('active');

                // Cargar la escena asociada en el SceneManager
                const SceneClass = this.sceneMapping[cameraKey];
                if (SceneClass) {
                    this.sceneManager.loadScene(cameraKey, SceneClass);
                } else {
                    console.error(`No se encontró la clase de escena para la clave: ${cameraKey}`);
                }
            });
        });
    }
}
