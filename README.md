# Taller: Dominando las Cámaras en Babylon.js (Edición Cómic / Cel-Shading)

Este proyecto es una plataforma interactiva en 3D rediseñada bajo una estética retro de **Cómic / Cel-Shading** y dotada de una interfaz de usuario caricaturesca en español. Sirve para aprender de manera práctica el funcionamiento, configuración e interacciones de las cámaras principales de **Babylon.js**.

---

## 🎨 Características Visuales y Estilo Cómic

- **Post-procesamiento Cel-Shading (`src/effects/CelShading.js`)**: Filtro Sobel personalizado que dibuja contornos negros definidos alrededor de la geometría de la escena analizando el búfer de profundidad y el búfer de color, combinando esto con una posterización de color a 5 niveles (sombreado por bandas). El skybox y los fondos están excluidos de las siluetas negras.
- **Hoja de Estilos `comic.css`**: Todo el sistema de interfaz utiliza la tipografía **Comic Neue** con bordes rígidos negros de 4px, sombras rígidas (`box-shadow` e `text-shadow`) y colores de fondo estilo viñeta retro (amarillo, naranja y rojo vibrantes).
- **Efectos Flotantes Cómic**: Un sistema integrado en la UI genera textos flotantes 2D temporales proyectados desde posiciones 3D en pantalla (como "¡BANG!", "¡POP!", "¡PUM!", "¡TURBO!") ante cada acción clave.
- **Resplandores Neón**: Incorporación de capas de resplandor (`GlowLayer`) para hacer que el Sol, los aros espaciales, los disparos láser y las luces del museo tengan un brillo premium.

---

## 🏛️ Arquitectura del Proyecto

El código fuente está estructurado de manera modular siguiendo estándares limpios y mantenibles de ES6:

- `index.html`: Contiene el canvas 3D y los contenedores de overlays para la UI de cómic y la viñeta de victoria.
- `comic.css`: Estilizado integral de botones, paneles de cómic, tipografía y animaciones CSS (confeti, flotación).
- `/src/main.js`: Inicializa el `SceneManager` y el selector de cámaras.
- `/src/config/`: Contiene la parametrización de cámaras (`camera.config.js`), escenas (`scene.config.js`) y assets procedurales (`assets.config.js`).
- `/src/core/`:
  - `SceneManager.js`: Gestiona el ciclo de vida de la escena, el render loop, y aplica el post-process de Cel Shading en cada carga.
  - `CameraManager.js`: Orquesta la creación de cámaras.
  - `AssetLoader.js`: Genera dinámicamente texturas procedimentales en un lienzo 2D (ladrillos dibujados a mano, nebulosas pastel, estrellas pastel, propulsores puff con borde, explosiones de tinta, pops).
- `/src/effects/CelShading.js`: Shader fragmentario y post-procesamiento de cel-shading.
- `/src/scenes/`: Lógica de juego específica para cada cámara.
- `/src/entities/`: Entidades del juego como planetas (`Planet.js`), nave (`Player.js`) y asteroides (`Enemy.js`).
- `/src/ui/`: `UIController.js` (UI en español, velocímetro, cronómetros y popups flotantes) y `CameraSwitcher.js`.

---

## 🎮 Los 5 Mini-proyectos & Cámaras

### 🪐 1. ArcRotateCamera — Sistema Solar (Puntuación de Planetas)
- **Concepto:** Orbita alrededor de un pivote físico (el Sol).
- **Visuales Cel-Shading:** Planetas pintados con texturas planas vibrantes y el Sol dotado de un resplandor neón sutil. Fondo de estrellas pastel.
- **Interactividad:** Haz clic en los planetas para visitarlos; esto genera una explosión de partículas tipo estrella de cómic y hace flotar un cartel "¡POP!" sobre ellos en 2D. El panel inferior te permite seguir planetas con transiciones suaves (Lerp) y ajustar la velocidad del tiempo.

### 🏛️ 2. FreeCamera — Museo de Arte 3D (Objetos Ocultos)
- **Concepto:** Recorrido en primera persona tipo shooter con colisiones y gravedad terrestres.
- **Visuales Cel-Shading:** Paredes del museo recubiertas de ladrillos con textura dibujada a mano, pedestales/columnas oscuros, esculturas auto-iluminadas y luces colgantes de tambor neón en el techo.
- **Interactividad:** Explora el museo y acércate a los 5 orbes dorados ocultos. Al descubrirlos, el objeto desaparece, suena/flota un cartel "¡ENCONTRADO!" y se incrementa el marcador estilo manga.

### 🚀 3. FollowCamera — Persecución de Nave Espacial (Carrera)
- **Concepto:** Seguimiento elástico de la nave con amortiguación en curvas cerradas.
- **Visuales Cel-Shading:** Nave de colores azul y rojo con contorno blanco y propulsor que suelta puffs de humo blanco delineados. Fondo de nebulosa giratoria pastel y aros neón brillantes.
- **Interactividad:** Vuela cruzando aros WASD para ganar puntos y generar explosiones de puffs naranjas con el cartel "¡TURBO!" o "¡BIEN!" flotando sobre ellos. El velocímetro cómic de la UI se llena dinámicamente.

### 🕶️ 4. AnaglyphArcRotateCamera — Laberinto de Neón (Juego del Héroe)
- **Concepto:** Renderizado estereoscópico para gafas 3D (Rojo/Cian) y laberinto flotante.
- **Visuales Cel-Shading:** Paredes del laberinto en colores fucsia y cian con estrellas stardust violeta flotando lentamente en el espacio.
- **Interactividad:** Controla una esfera héroe dorada con WASD/flechas y llévala hasta la meta verde antes de que se acabe el cronómetro de 60 segundos. Al ganar, se detiene el juego y aparece una gran viñeta de victoria con confeti cayendo por toda la pantalla.

### 📱 5. DeviceOrientationCamera — Tiro Cósmico (Giroscopio)
- **Concepto:** Giroscopio móvil o arrastre en PC para apuntar 360 grados.
- **Visuales Cel-Shading:** Asteroides rocosos asimétricos flotantes y haz de láser cian brillante con resplandor neón.
- **Interactividad:** Apunta con la retícula cómic y pulsa "¡FUEGO!" o espacio para disparar. Cada disparo muestra un popup "¡BANG!" y al impactar un asteroide genera una explosión de tinta negra con pops de "¡BOOM!" o "¡PUM!".

---

## 🚀 Instrucciones para Ejecutar Localmente

Debido al uso de módulos ES6 nativos en el navegador, es necesario levantar un servidor web local en la carpeta raíz del proyecto.

### Opción 1: Levantar Servidor con Node.js
```bash
npx http-server .
```
o bien:
```bash
npx serve .
```

### Opción 2: Levantar Servidor con Python
```bash
python -m http.server 8080
```

Accede desde tu navegador a: [http://localhost:8080](http://localhost:8080).

