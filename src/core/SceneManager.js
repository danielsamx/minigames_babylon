/**
 * Administrador central del motor de Babylon.js y de las escenas del taller.
 */
import { CameraManager } from './CameraManager.js';
import { UIController }  from '../ui/UIController.js';
import { AudioManager }  from './AudioManager.js';
import { applyCelShading } from '../effects/CelShading.js';

export class SceneManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`No se encontró el canvas con ID: ${canvasId}`);
            return;
        }

        // Motor de Babylon.js
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        this.currentScene         = null;
        this.currentSceneInstance = null;
        this.currentSceneKey      = null;
        this.currentSceneClass    = null;
        this.cameraManager        = null;
        this.uiController         = null;

        // Sistema de Audio
        this.audioManager = new AudioManager();

        this.init();
    }

    init() {
        // Bucle de renderizado vacío inicial
        this.engine.runRenderLoop(() => {
            if (this.currentScene) {
                if (this.currentSceneInstance && typeof this.currentSceneInstance.update === 'function') {
                    this.currentSceneInstance.update();
                }
                this.currentScene.render();
            }
        });

        // Evento de redimensionamiento
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        // Inicializar UIController
        this.uiController = new UIController(this);

        // Reanudar AudioContext al primer gesto del usuario
        document.addEventListener('click', () => {
            if (this.audioManager) this.audioManager._resume();
        }, { once: true });
    }

    /**
     * Carga dinámicamente una de las escenas del taller.
     * @param {string} sceneKey
     * @param {Function} SceneClass
     */
    async loadScene(sceneKey, SceneClass) {
        // Guardar clase actual para el botón de reintentar
        this.currentSceneKey   = sceneKey;
        this.currentSceneClass = SceneClass;

        // Pantalla de carga
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '1';
            loader.style.display = 'flex';
        }

        // Detener render loop
        this.engine.stopRenderLoop();

        // Detener audio anterior
        if (this.audioManager) this.audioManager.stopAll();

        // Limpiar escena anterior
        if (this.currentScene) {
            if (this.currentSceneInstance && typeof this.currentSceneInstance.dispose === 'function') {
                this.currentSceneInstance.dispose();
            }
            this.currentScene.dispose();
            this.currentScene         = null;
            this.currentSceneInstance = null;
        }

        // Nueva escena de Babylon
        const scene = new BABYLON.Scene(this.engine);
        this.currentScene = scene;

        // CameraManager
        this.cameraManager = new CameraManager(scene);

        // Instanciar e inicializar la escena
        this.currentSceneInstance = new SceneClass(scene, this.cameraManager, this);
        await this.currentSceneInstance.init();

        // Enlazar cámara al lienzo
        this.cameraManager.attachActiveCamera(this.canvas);

        // Aplicar Cel Shading
        if (this.cameraManager.activeCamera) {
            applyCelShading(scene, this.cameraManager.activeCamera);
        }

        // Actualizar UI (pasa también SceneClass para el botón Replay/Retry)
        this.uiController.updateForScene(sceneKey, this.currentSceneInstance, SceneClass);

        // Música de fondo
        if (this.audioManager) this.audioManager.playBackground(sceneKey);

        // Reiniciar render loop
        this.engine.runRenderLoop(() => {
            if (this.currentScene) {
                if (this.currentSceneInstance && typeof this.currentSceneInstance.update === 'function') {
                    this.currentSceneInstance.update();
                }
                this.currentScene.render();
            }
        });

        // Ocultar pantalla de carga
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => { loader.style.display = 'none'; }, 500);
            }
        }, 300);

        console.log(`Escena [${sceneKey}] cargada.`);
    }
}
