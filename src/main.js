/**
 * Punto de entrada principal de la aplicación.
 * Arranca el motor de renderizado y el selector de cámaras/escenas.
 */
import { SceneManager } from './core/SceneManager.js';
import { CameraSwitcher } from './ui/CameraSwitcher.js';
import { SceneArcRotate } from './scenes/SceneArcRotate.js';

window.addEventListener('DOMContentLoaded', () => {
    // 1. Instanciar el gestor de escenas central en el canvas HTML
    const sceneManager = new SceneManager('renderCanvas');

    // 2. Instanciar el selector de cámaras (enlaza los botones de UI superiores)
    new CameraSwitcher(sceneManager);

    // 3. Cargar la primera escena por defecto: ArcRotate (Sistema Solar)
    sceneManager.loadScene('arcRotate', SceneArcRotate);
});
