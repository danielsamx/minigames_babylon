/**
 * Controlador global de la interfaz de usuario.
 * Gestiona paneles de estadísticas, overlays de victoria/game-over, burbujas flotantes y sonido.
 */
export class UIController {
    /**
     * @param {SceneManager} sceneManager
     */
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        
        // Elementos DOM principales
        this.titleEl        = document.getElementById('camera-title');
        this.descEl         = document.getElementById('camera-desc');
        this.iconEl         = document.getElementById('camera-icon');
        this.controlsListEl = document.getElementById('camera-controls');
        this.statsContainer = document.getElementById('scene-stats');

        // Información de cada mini-juego
        this.cameraInfo = {
            arcRotate: {
                title: '🪐 Órbita Cósmica',
                icon: '🪐',
                gameName: 'Órbita Cósmica',
                desc: '¡El universo gira a tus pies! Orbita el sistema solar con la ArcRotateCamera y visita los 5 planetas. ¡Haz clic sobre cada uno para registrar tu exploración!',
                controls: [
                    { keys: ['Arrastrar Click Izq.'], action: 'Girar alrededor del Sol' },
                    { keys: ['Rueda del Ratón'],    action: 'Zoom (acercar / alejar)' },
                    { keys: ['Click Dcho. + Arrastrar'], action: 'Desplazamiento de plano' }
                ]
            },
            free: {
                title: '🏛️ La Galería Prohibida',
                icon: '🏛️',
                gameName: 'La Galería Prohibida',
                desc: '¡Un museo lleno de secretos! Camina en primera persona con la FreeCamera, sentirás gravedad y colisiones reales. Encuentra los 5 objetos dorados ocultos.',
                controls: [
                    { keys: ['W', 'A', 'S', 'D'],      action: 'Caminar (adelante/lados/atrás)' },
                    { keys: ['Mover el Ratón'],          action: 'Mirar alrededor' },
                    { keys: ['Flechas'],                 action: 'Movimiento alternativo' }
                ]
            },
            follow: {
                title: '🚀 Piloto de Estrellas',
                icon: '🚀',
                gameName: 'Piloto de Estrellas',
                desc: '¡Acelera a la velocidad de la luz! Pilota tu nave con la FollowCamera pegada a tu espalda. Cruza todos los aros neón para conseguir la puntuación máxima.',
                controls: [
                    { keys: ['W', 'S'],     action: 'Inclinar arriba / abajo (Pitch)' },
                    { keys: ['A', 'D'],     action: 'Girar izquierda / derecha (Yaw)' },
                    { keys: ['← ↑ ↓ →'],  action: 'Controles alternativos de vuelo' }
                ]
            },
            anaglyph: {
                title: '🕶️ El Laberinto del Tiempo',
                icon: '🕶️',
                gameName: 'El Laberinto del Tiempo',
                desc: '¡El tiempo corre! Usa la AnaglyphCamera estereoscópica (gafas Rojo/Cian) y mueve la esfera hasta la salida antes de que expire el contador.',
                controls: [
                    { keys: ['W', 'A', 'S', 'D'],   action: 'Mover la esfera héroe' },
                    { keys: ['Click + Arrastrar'],   action: 'Rotar perspectiva 3D' },
                    { keys: ['Deslizador IPD'],       action: 'Ajustar separación de lentes' }
                ]
            },
            deviceOrientation: {
                title: '🎯 Cazador de Asteroides',
                icon: '🎯',
                gameName: 'Cazador de Asteroides',
                desc: '¡El espacio te necesita! Usa la DeviceOrientationCamera (giroscopio en móvil / arrastre en PC) para apuntar y destruir los asteroides flotantes con láseres.',
                controls: [
                    { keys: ['Girar Dispositivo'],       action: 'Apuntar con giroscopio físico' },
                    { keys: ['Click + Arrastrar'],        action: 'Apuntar en escritorio' },
                    { keys: ['Espacio / Botón FUEGO'], action: 'Disparar ráfaga de láser' }
                ]
            }
        };

        // Enlazar overlays de victoria y game over
        this._bindOverlayButtons();
        
        this.confettiInterval = null;
        this._currentSceneKey = null;
        this._currentSceneInstance = null;
    }

    // ─────────────────────────────────────────────────────────────────
    //  OVERLAYS
    // ─────────────────────────────────────────────────────────────────

    _bindOverlayButtons() {
        // ── Victoria ──
        const btnClose = document.getElementById('btn-victory-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                const overlay = document.getElementById('victory-overlay');
                if (overlay) overlay.style.display = 'none';
                this.stopConfetti();
            });
        }
        const btnReplay = document.getElementById('btn-victory-replay');
        if (btnReplay) {
            btnReplay.addEventListener('click', () => {
                const overlay = document.getElementById('victory-overlay');
                if (overlay) overlay.style.display = 'none';
                this.stopConfetti();
                this._reloadCurrentScene();
            });
        }

        // ── Game Over ──
        const btnRetry = document.getElementById('btn-gameover-retry');
        if (btnRetry) {
            btnRetry.addEventListener('click', () => {
                const overlay = document.getElementById('gameover-overlay');
                if (overlay) overlay.style.display = 'none';
                this._reloadCurrentScene();
            });
        }
        const btnGoClose = document.getElementById('btn-gameover-close');
        if (btnGoClose) {
            btnGoClose.addEventListener('click', () => {
                const overlay = document.getElementById('gameover-overlay');
                if (overlay) overlay.style.display = 'none';
            });
        }
    }

    _reloadCurrentScene() {
        if (this._currentSceneKey && this._currentSceneClass && this.sceneManager) {
            this.sceneManager.loadScene(this._currentSceneKey, this._currentSceneClass);
        }
    }

    /**
     * Muestra la viñeta de victoria.
     * @param {string} message
     * @param {number} score
     * @param {string} sceneKey
     */
    triggerVictory(message, score = 0, sceneKey = '') {
        const overlay  = document.getElementById('victory-overlay');
        const msgEl    = document.getElementById('victory-message');
        const scoreEl  = document.getElementById('victory-score');
        const recordEl = document.getElementById('victory-record');

        if (!overlay) return;

        if (msgEl)   msgEl.innerText   = message;
        if (scoreEl) scoreEl.innerText = `${score.toLocaleString()} pts`;

        // Récord
        if (sceneKey) {
            const key = `record_${sceneKey}`;
            const prev = parseInt(localStorage.getItem(key) || '0');
            if (score > prev) {
                localStorage.setItem(key, score);
                if (recordEl) recordEl.innerText = `🏆 ¡Nuevo récord! Anterior: ${prev.toLocaleString()} pts`;
            } else {
                if (recordEl) recordEl.innerText = `🏅 Récord: ${prev.toLocaleString()} pts`;
            }
        }

        overlay.style.display = 'flex';
        this.startConfetti();

        // Sonido de victoria
        if (this.sceneManager && this.sceneManager.audioManager) {
            this.sceneManager.audioManager.playVictory();
        }
    }

    /**
     * Muestra el overlay de game over.
     * @param {string} message
     * @param {number} score
     * @param {string} sceneKey
     */
    triggerGameOver(message = '¡Se acabó el tiempo!', score = 0, sceneKey = '') {
        const overlay  = document.getElementById('gameover-overlay');
        const msgEl    = document.getElementById('gameover-message');
        const scoreEl  = document.getElementById('gameover-score');
        const recordEl = document.getElementById('gameover-record');

        if (!overlay) return;

        if (msgEl)   msgEl.innerText   = message;
        if (scoreEl) scoreEl.innerText = `${score.toLocaleString()} pts`;

        if (sceneKey) {
            const key = `record_${sceneKey}`;
            const prev = parseInt(localStorage.getItem(key) || '0');
            if (recordEl) recordEl.innerText = `🏅 Récord actual: ${prev.toLocaleString()} pts`;
        }

        overlay.style.display = 'flex';

        // Sonido de game over
        if (this.sceneManager && this.sceneManager.audioManager) {
            this.sceneManager.audioManager.playGameOver();
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  PROYECCIÓN 3D → 2D  y  BURBUJAS FLOTANTES
    // ─────────────────────────────────────────────────────────────────

    projectToScreen(position3D, scene) {
        if (!window.BABYLON) return { x: 0, y: 0 };
        const BABYLON = window.BABYLON;
        const engine = scene.getEngine();
        const globalViewport = scene.activeCamera.viewport.toGlobal(
            engine.getRenderWidth(), engine.getRenderHeight()
        );
        const projected = BABYLON.Vector3.Project(
            position3D,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            globalViewport
        );
        return { x: projected.x, y: projected.y };
    }

    showFloatingComicBubble(text, x, y) {
        const overlay = document.getElementById('popup-overlay');
        if (!overlay) return;
        const popup = document.createElement('div');
        popup.className = 'floating-comic-text';
        popup.innerText = text;
        popup.style.left = `${x}px`;
        popup.style.top  = `${y}px`;
        const rot = (Math.random() - 0.5) * 28;
        popup.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
        overlay.appendChild(popup);
        setTimeout(() => popup.remove(), 850);
    }

    showFloatingBubbleAt3D(text, position3D, scene) {
        const coords = this.projectToScreen(position3D, scene);
        this.showFloatingComicBubble(text, coords.x, coords.y);
    }

    // ─────────────────────────────────────────────────────────────────
    //  CONFETTI
    // ─────────────────────────────────────────────────────────────────

    startConfetti() {
        this.stopConfetti();
        const colors = ['#facc15', '#f97316', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#22c55e'];
        const overlay = document.getElementById('victory-overlay');
        this.confettiInterval = setInterval(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width  = `${5 + Math.random() * 8}px`;
            confetti.style.height = `${10 + Math.random() * 12}px`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animationDuration = `${1.5 + Math.random() * 2}s`;
            overlay.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, 90);
    }

    stopConfetti() {
        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
            this.confettiInterval = null;
        }
        document.querySelectorAll('.confetti').forEach(el => el.remove());
    }

    // ─────────────────────────────────────────────────────────────────
    //  ANIMACIÓN DE PUNTUACIÓN
    // ─────────────────────────────────────────────────────────────────

    /**
     * Actualiza un elemento de puntuación con efecto "pop".
     */
    animateScoreEl(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.classList.remove('pop');
        // Re-trigger animation
        void el.offsetWidth;
        el.classList.add('pop');
        setTimeout(() => el.classList.remove('pop'), 300);
    }

    // ─────────────────────────────────────────────────────────────────
    //  RÉCORD LOCAL
    // ─────────────────────────────────────────────────────────────────

    getRecord(sceneKey) {
        return parseInt(localStorage.getItem(`record_${sceneKey}`) || '0');
    }

    saveRecord(sceneKey, score) {
        const prev = this.getRecord(sceneKey);
        if (score > prev) {
            localStorage.setItem(`record_${sceneKey}`, score);
            return true; // nuevo récord
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────────
    //  SETUP UIs POR ESCENA
    // ─────────────────────────────────────────────────────────────────

    setupArcRotateUI(scene) {
        if (!this.statsContainer) return;
        const record = this.getRecord('arcRotate');
        this.statsContainer.innerHTML = `
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Planetas Visitados</span>
                <span class="stat-value" id="val-planet-score">0 / 5</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Puntuación</span>
                <span class="stat-value" id="val-arc-points">0</span>
            </div>
            <div class="stat-row" style="margin-bottom:8px;">
                <span class="stat-label">🏅 Récord</span>
                <span class="stat-value" style="color:#facc15;">${record}</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Velocidad del tiempo</span>
                <span class="stat-value" id="val-timescale">1.0x</span>
            </div>
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                <button class="comic-btn interactive" style="flex:1; padding:4px 2px; font-size:0.8rem;" id="btn-slow">LENTO</button>
                <button class="comic-btn interactive" style="flex:1; padding:4px 2px; font-size:0.8rem;" id="btn-normal">NORMAL</button>
                <button class="comic-btn interactive" style="flex:1; padding:4px 2px; font-size:0.8rem;" id="btn-pause">PAUSA</button>
            </div>
            <div class="stat-label" style="font-size:0.82rem; font-weight:600; margin-bottom:4px;">Enfocar en:</div>
            <select class="camera-btn interactive" id="select-focus" style="width:100%; border-radius:8px; padding:6px; background:#1e293b; color:#f1f5f9; border:1px solid rgba(255,255,255,0.1);">
                <option value="-1">☀️ Sol (Centro)</option>
                <option value="0">🪨 Mercurio</option>
                <option value="1">🌫️ Venus</option>
                <option value="2">🌍 Tierra</option>
                <option value="3">🔴 Marte</option>
                <option value="4">🟠 Júpiter</option>
            </select>
        `;
        document.getElementById('btn-slow').addEventListener('click', () => scene.updateTimeScale(0.2));
        document.getElementById('btn-normal').addEventListener('click', () => scene.updateTimeScale(1.0));
        document.getElementById('btn-pause').addEventListener('click', () => scene.updateTimeScale(0.0));
        document.getElementById('select-focus').addEventListener('change', (e) => {
            scene.focusedIndex = parseInt(e.target.value);
        });
        this.updateArcRotateUI(scene);
    }

    updateArcRotateUI(scene) {
        const planetEl = document.getElementById('val-planet-score');
        const pointsEl = document.getElementById('val-arc-points');
        if (!scene) return;
        const count = scene.visitedPlanets ? scene.visitedPlanets.size : 0;
        if (planetEl) planetEl.innerText = `${count} / 5`;
        if (pointsEl) {
            pointsEl.innerText = scene.score || 0;
            this.animateScoreEl('val-arc-points');
        }
    }

    setupFreeUI(scene) {
        if (!this.statsContainer) return;
        const record = this.getRecord('free');
        this.statsContainer.innerHTML = `
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Objetos Encontrados</span>
                <span class="stat-value" id="val-objects-found">0 / 5</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Puntuación</span>
                <span class="stat-value" id="val-free-points">0</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">🏅 Récord</span>
                <span class="stat-value" style="color:#facc15;">${record}</span>
            </div>
            <div class="stat-row" style="margin-bottom:4px;">
                <span class="stat-label">Posición X</span>
                <span class="stat-value" id="val-x" style="font-size:0.85rem;">0.00</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Posición Z</span>
                <span class="stat-value" id="val-z" style="font-size:0.85rem;">-15.00</span>
            </div>
        `;
        this.updateFreeUI(scene);
    }

    updateFreeUI(scene) {
        if (!scene) return;
        const el  = document.getElementById('val-objects-found');
        const pts = document.getElementById('val-free-points');
        if (el) el.innerText  = `${scene.foundObjects || 0} / 5`;
        if (pts) {
            pts.innerText = scene.score || 0;
            this.animateScoreEl('val-free-points');
        }
    }

    setupFollowUI(scene) {
        if (!this.statsContainer) return;
        const record = this.getRecord('follow');
        this.statsContainer.innerHTML = `
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Puntuación</span>
                <span class="stat-value" id="val-score">0</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">🏅 Récord</span>
                <span class="stat-value" style="color:#facc15;">${record}</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Aros Cruzados</span>
                <span class="stat-value" id="val-rings">0 / ${scene.config.ringCount}</span>
            </div>
            <div class="stat-row" style="margin-bottom:2px; flex-direction:column; align-items:flex-start;">
                <span class="stat-label" id="val-speed-txt">Velocidad: 0 km/h</span>
                <div class="speedometer-container">
                    <div class="speedometer-bar" id="speed-bar" style="width:0%"></div>
                </div>
            </div>
        `;
    }

    updateFollowUI(scene) {
        if (!scene) return;
        const scoreEl    = document.getElementById('val-score');
        const ringsEl    = document.getElementById('val-rings');
        const speedTxtEl = document.getElementById('val-speed-txt');
        const speedBarEl = document.getElementById('speed-bar');

        if (scoreEl) {
            scoreEl.innerText = scene.score;
            this.animateScoreEl('val-score');
        }
        if (ringsEl) {
            const passed = scene.rings ? scene.rings.filter(r => r.passed).length : 0;
            ringsEl.innerText = `${passed} / ${scene.config.ringCount}`;
        }
        if (speedTxtEl && scene.player) {
            const sp = Math.round(scene.player.speed * 10);
            speedTxtEl.innerText = `Velocidad: ${sp} km/h`;
            if (speedBarEl) {
                const pct = Math.min((scene.player.speed / 25) * 100, 100);
                speedBarEl.style.width = `${pct}%`;
            }
        }
    }

    setupAnaglyphUI(scene) {
        if (!this.statsContainer) return;
        const record = this.getRecord('anaglyph');
        this.statsContainer.innerHTML = `
            <div class="stat-row" style="margin-bottom:8px;">
                <span class="stat-label">⏱️ Tiempo Restante</span>
                <span class="stat-value" id="val-timer" style="font-size:1.4rem; font-weight:900;">60s</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Puntuación</span>
                <span class="stat-value" id="val-anaglyph-score">0</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">🏅 Récord</span>
                <span class="stat-value" style="color:#facc15;">${record}</span>
            </div>
            <div class="stat-row" style="margin-bottom:4px;">
                <span class="stat-label">Lente 3D (IPD)</span>
                <span class="stat-value" id="val-eyespace" style="font-size:0.85rem;">0.06m</span>
            </div>
            <div>
                <input class="interactive" type="range" id="slider-eyespace" min="0.01" max="0.20" step="0.005" value="0.06" style="width:100%; accent-color:#f97316;">
            </div>
        `;
        const slider = document.getElementById('slider-eyespace');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                const txt = document.getElementById('val-eyespace');
                if (txt) txt.innerText = `${val.toFixed(3)}m`;
                if (scene.camera) scene.camera.eyeSpace = val;
            });
        }
    }

    updateAnaglyphUI(scene) {
        if (!scene) return;
        const timerEl = document.getElementById('val-timer');
        const scoreEl = document.getElementById('val-anaglyph-score');
        if (timerEl) {
            const secs = Math.ceil(scene.timeLeft);
            timerEl.innerText = `${secs}s`;
            timerEl.style.color = scene.timeLeft < 10 ? '#ef4444' : '#f97316';
            timerEl.style.animation = scene.timeLeft < 10 ? 'popIn 0.5s infinite alternate' : 'none';
        }
        if (scoreEl) scoreEl.innerText = scene.score || 0;
    }

    setupDeviceOrientationUI(scene) {
        const actionOverlay = document.getElementById('action-overlay');
        if (actionOverlay) actionOverlay.style.display = 'flex';

        if (!this.statsContainer) return;
        const record = this.getRecord('deviceOrientation');
        this.statsContainer.innerHTML = `
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Puntuación</span>
                <span class="stat-value" id="val-shoot-score">0</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">🏅 Récord</span>
                <span class="stat-value" style="color:#facc15;">${record}</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Racha Actual 🔥</span>
                <span class="stat-value" id="val-streak">0</span>
            </div>
            <div class="stat-row" style="margin-bottom:6px;">
                <span class="stat-label">Disparos</span>
                <span class="stat-value" id="val-shots-fired">0</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Blancos Activos</span>
                <span class="stat-value" id="val-targets-count">${scene.config.targetCount}</span>
            </div>
        `;
        this.updateDeviceOrientationUI(scene);
    }

    updateDeviceOrientationUI(scene) {
        if (!scene) return;
        const scoreEl   = document.getElementById('val-shoot-score');
        const firedEl   = document.getElementById('val-shots-fired');
        const countEl   = document.getElementById('val-targets-count');
        const streakEl  = document.getElementById('val-streak');

        if (scoreEl) {
            scoreEl.innerText = scene.score;
            this.animateScoreEl('val-shoot-score');
        }
        if (firedEl)  firedEl.innerText  = scene.shotsFired || 0;
        if (countEl && scene.targets) countEl.innerText = scene.targets.length;
        if (streakEl) streakEl.innerText = scene.streak || 0;
    }

    // ─────────────────────────────────────────────────────────────────
    //  ACTUALIZAR ESCENA ACTIVA
    // ─────────────────────────────────────────────────────────────────

    updateForScene(sceneKey, sceneInstance, SceneClass) {
        const info = this.cameraInfo[sceneKey];
        if (!info) return;

        this._currentSceneKey      = sceneKey;
        this._currentSceneInstance = sceneInstance;
        this._currentSceneClass    = SceneClass;

        // Limpiar overlays previos
        this.stopConfetti();
        ['victory-overlay', 'gameover-overlay'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const actionOverlay = document.getElementById('action-overlay');
        if (actionOverlay) actionOverlay.style.display = 'none';

        // Cabecera informativa
        if (this.titleEl)  this.titleEl.innerText  = info.gameName;
        if (this.iconEl)   this.iconEl.innerText   = info.icon;
        if (this.descEl)   this.descEl.innerText   = info.desc;

        // Panel de estadísticas específico
        const setup = {
            arcRotate:         () => this.setupArcRotateUI(sceneInstance),
            free:              () => this.setupFreeUI(sceneInstance),
            follow:            () => this.setupFollowUI(sceneInstance),
            anaglyph:          () => this.setupAnaglyphUI(sceneInstance),
            deviceOrientation: () => this.setupDeviceOrientationUI(sceneInstance)
        };
        if (setup[sceneKey]) setup[sceneKey]();

        // Lista de controles
        if (this.controlsListEl) {
            this.controlsListEl.innerHTML = '';
            info.controls.forEach(ctrl => {
                const item = document.createElement('div');
                item.className = 'control-item';
                const badgesHtml = ctrl.keys.map(k => `<span class="key-badge">${k}</span>`).join(' + ');
                item.innerHTML = `
                    <span style="color:#cbd5e1; font-size:0.78rem;">${ctrl.action}</span>
                    <div>${badgesHtml}</div>
                `;
                this.controlsListEl.appendChild(item);
            });
        }

        // Botones del selector
        document.querySelectorAll('.camera-btn[data-camera]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.camera === sceneKey);
        });
    }
}
