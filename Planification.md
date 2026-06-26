# ROL Y OBJETIVO
Actúa como un **arquitecto de software especializado en Babylon.js** y un **desarrollador full-stack 3D**. Tu tarea es **DESARROLLAR COMPLETAMENTE** el taller "Dominando las Cámaras en Babylon.js", generando **todo el código fuente** de los 5 mini-proyectos con una arquitectura escalable y profesional.

---

# CONTEXTO DEL TALLER
Debo crear **5 mini-proyectos funcionales**, uno para cada tipo de cámara de Babylon.js. Las ideas están en el PDF "Taller de Cámaras Babylon.js.pdf" (mismo directorio). Como no tengo acceso al PDF desde este chat, **tú debes proponer las 5 ideas** (una por cámara) basadas en proyectos típicos de este taller.

## Las 5 Cámaras:
1. **ArcRotateCamera** – Órbita alrededor de un objetivo.
2. **FreeCamera** – Movimiento en primera persona con teclado/mouse.
3. **FollowCamera** – Seguimiento suave de un objeto en movimiento.
4. **Anaglyph / Stereoscopic Camera** – Efectos 3D estereoscópicos / VR.
5. **DeviceOrientationCamera** – Giroscopio de dispositivos móviles.

---

# REQUERIMIENTO PRINCIPAL: CÓDIGO 100% COMPLETO Y ESCALABLE

Debes generar **TODOS los archivos** necesarios para un proyecto funcional. La estructura debe ser:

```
/taller-camaras-babylonjs
├── index.html
├── package.json (opcional, si usas módulos)
├── /src
│   ├── main.js                    # Punto de entrada
│   ├── /config
│   │   ├── camera.config.js       # Configuración de todas las cámaras
│   │   ├── scene.config.js        # Configuración de la escena
│   │   └── assets.config.js       # Rutas de assets
│   ├── /core
│   │   ├── SceneManager.js        # Gestor central de la escena
│   │   ├── CameraManager.js       # Gestor de cámaras (creación, cambio, destrucción)
│   │   └── AssetLoader.js         # Carga eficiente de assets
│   ├── /cameras
│   │   ├── ArcRotateCamera.js     # Implementación específica
│   │   ├── FreeCamera.js          # Implementación específica
│   │   ├── FollowCamera.js        # Implementación específica
│   │   ├── AnaglyphCamera.js      # Implementación específica
│   │   └── DeviceOrientationCamera.js # Implementación específica
│   ├── /entities
│   │   ├── Planet.js              # Ejemplo de entidad reutilizable
│   │   ├── Player.js              # Ejemplo de entidad reutilizable
│   │   └── Enemy.js               # Ejemplo de entidad reutilizable
│   ├── /scenes
│   │   ├── SceneArcRotate.js      # Escena para ArcRotateCamera
│   │   ├── SceneFree.js           # Escena para FreeCamera
│   │   ├── SceneFollow.js         # Escena para FollowCamera
│   │   ├── SceneAnaglyph.js       # Escena para AnaglyphCamera
│   │   └── SceneDeviceOrientation.js # Escena para DeviceOrientationCamera
│   ├── /ui
│   │   ├── UIController.js        # Control de interfaz (botones, paneles)
│   │   └── CameraSwitcher.js      # UI para cambiar entre cámaras
│   ├── /utils
│   │   ├── helpers.js             # Funciones auxiliares
│   │   └── math.js                # Utilidades matemáticas
│   └── /assets
│       ├── /textures
│       │   ├── grid.png
│       │   └── planet.jpg
│       └── /models
│           └── (modelos opcionales)
└── README.md                       # Documentación del proyecto
```

---

# LO QUE DEBES GENERAR

## 1. TODOS los archivos de código con su contenido completo
Para CADA archivo listado arriba, debes proporcionar:
- El código fuente completo y funcional.
- Comentarios en español explicando cada sección.
- Configuraciones bien definidas y parametrizadas.

## 2. Las 5 escenas completamente funcionales
Cada escena debe:
- Tener su propia cámara configurada.
- Incluir objetos 3D interesantes (geometrías, luces, texturas).
- Tener interacción específica para esa cámara.
- Ser visualmente atractiva y única.

## 3. Sistema de cambio entre cámaras
- Un menú/UI que permita cambiar entre las 5 cámaras en tiempo real.
- Cada cambio debe cargar la escena correspondiente sin recargar la página.

## 4. Configuración centralizada
- Todas las configuraciones (posiciones, velocidades, colores) en un solo lugar.
- Fácil de modificar y extender.

## 5. Documentación completa
- README.md con instrucciones de instalación y ejecución.
- Comentarios en todo el código.
- Explicación de la arquitectura y cómo extenderla.

---

# IDEAS DE PROYECTOS QUE DEBES IMPLEMENTAR

Para cada cámara, propón y desarrolla una idea creativa:

| Cámara | Idea de Proyecto (ejemplo) |
|--------|---------------------------|
| ArcRotateCamera | **Sistema Solar Interactivo** - El usuario orbita alrededor del sol con planetas girando. |
| FreeCamera | **Museo 3D** - Recorrido en primera persona por una galería con esculturas. |
| FollowCamera | **Carrera de Naves** - Una nave espacial que sigue a un objetivo en movimiento. |
| AnaglyphCamera | **Laberinto 3D** - Un laberinto con efecto estereoscópico rojo/azul. |
| DeviceOrientationCamera | **Tiro al Blanco Móvil** - Apuntas moviendo el dispositivo físico. |

*(Puedes proponer ideas diferentes si son más creativas)*

---

# RESTRICCIONES TÉCNICAS

- **Versión de Babylon.js**: Última estable (v6.x o v7.x) via CDN.
- **Formato**: Usar módulos ES6 (import/export).
- **Estilo de código**: Limpio, con nombres descriptivos y comentarios en español.
- **Performance**: Optimizado, sin memory leaks, con dispose adecuado.
- **Responsive**: Que funcione en diferentes tamaños de pantalla.
- **Assets**: Usar texturas generadas proceduralmente si no hay assets reales.

---

# FORMATO DE RESPUESTA QUE ESPERO

**NO** me des explicaciones largas. Quiero que **generes el código completo** de todos los archivos en un solo mensaje. Organiza tu respuesta así:

```
📁 ARCHIVO: index.html
[Contenido completo del archivo]

📁 ARCHIVO: src/main.js
[Contenido completo del archivo]

📁 ARCHIVO: src/config/camera.config.js
[Contenido completo del archivo]

... (todos los archivos)

📁 ARCHIVO: README.md
[Contenido completo del README]
```

# ENTREGABLE FINAL

Al final de tu respuesta, debo tener **TODO** el código necesario para:
1. Abrir `index.html` en un navegador.
2. Ver las 5 escenas funcionando.
3. Cambiar entre cámaras con la UI.
4. Entender y modificar el código fácilmente.

