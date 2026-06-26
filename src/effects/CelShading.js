/**
 * Post-procesamiento personalizado de Cel Shading (Toon Shading).
 * Aplica contornos negros mediante un filtro Sobel en profundidad y color,
 * junto con cuantización (posterización) de color para rampas de sombreado rígidas.
 */
export function applyCelShading(scene, camera) {
    if (!window.BABYLON) return null;
    const BABYLON = window.BABYLON;

    // 1. Registrar el Fragment Shader de Cel Shading si no existe aún
    if (!BABYLON.Effect.ShadersStore["celShadingFragmentShader"]) {
        BABYLON.Effect.ShadersStore["celShadingFragmentShader"] = `
            #ifdef GL_ES
            precision highp float;
            #endif

            varying vec2 vUV;
            uniform sampler2D textureSampler; // Búfer de color renderizado
            uniform sampler2D depthSampler;   // Búfer de profundidad
            uniform vec2 screenSize;

            // Función para cuantizar colores en bandas
            vec3 quantize(vec3 color, float steps) {
                return floor(color * steps) / steps;
            }

            void main(void) {
                vec2 texelSize = 1.0 / screenSize;

                // 1. Detección de Bordes en Profundidad (Sobel en Depth Map)
                float d00 = texture2D(depthSampler, vUV + vec2(-1.0, -1.0) * texelSize).r;
                float d01 = texture2D(depthSampler, vUV + vec2( 0.0, -1.0) * texelSize).r;
                float d02 = texture2D(depthSampler, vUV + vec2( 1.0, -1.0) * texelSize).r;
                float d10 = texture2D(depthSampler, vUV + vec2(-1.0,  0.0) * texelSize).r;
                float d11 = texture2D(depthSampler, vUV).r;
                float d12 = texture2D(depthSampler, vUV + vec2( 1.0,  0.0) * texelSize).r;
                float d20 = texture2D(depthSampler, vUV + vec2(-1.0,  1.0) * texelSize).r;
                float d21 = texture2D(depthSampler, vUV + vec2( 0.0,  1.0) * texelSize).r;
                float d22 = texture2D(depthSampler, vUV + vec2( 1.0,  1.0) * texelSize).r;

                float depthGX = (d02 + 2.0*d12 + d22) - (d00 + 2.0*d10 + d20);
                float depthGY = (d20 + 2.0*d21 + d22) - (d00 + 2.0*d01 + d02);
                float depthEdge = sqrt(depthGX * depthGX + depthGY * depthGY);

                // 2. Detección de Bordes en Color (Sobel en Grayscale)
                vec3 c00 = texture2D(textureSampler, vUV + vec2(-1.0, -1.0) * texelSize).rgb;
                vec3 c01 = texture2D(textureSampler, vUV + vec2( 0.0, -1.0) * texelSize).rgb;
                vec3 c02 = texture2D(textureSampler, vUV + vec2( 1.0, -1.0) * texelSize).rgb;
                vec3 c10 = texture2D(textureSampler, vUV + vec2(-1.0,  0.0) * texelSize).rgb;
                vec3 c11 = texture2D(textureSampler, vUV).rgb;
                vec3 c12 = texture2D(textureSampler, vUV + vec2( 1.0,  0.0) * texelSize).rgb;
                vec3 c20 = texture2D(textureSampler, vUV + vec2(-1.0,  1.0) * texelSize).rgb;
                vec3 c21 = texture2D(textureSampler, vUV + vec2( 0.0,  1.0) * texelSize).rgb;
                vec3 c22 = texture2D(textureSampler, vUV + vec2( 1.0,  1.0) * texelSize).rgb;

                float gray00 = dot(c00, vec3(0.299, 0.587, 0.114));
                float gray01 = dot(c01, vec3(0.299, 0.587, 0.114));
                float gray02 = dot(c02, vec3(0.299, 0.587, 0.114));
                float gray10 = dot(c10, vec3(0.299, 0.587, 0.114));
                float gray11 = dot(c11, vec3(0.299, 0.587, 0.114));
                float gray12 = dot(c12, vec3(0.299, 0.587, 0.114));
                float gray20 = dot(c20, vec3(0.299, 0.587, 0.114));
                float gray21 = dot(c21, vec3(0.299, 0.587, 0.114));
                float gray22 = dot(c22, vec3(0.299, 0.587, 0.114));

                float colorGX = (gray02 + 2.0*gray12 + gray22) - (gray00 + 2.0*gray10 + gray20);
                float colorGY = (gray20 + 2.0*gray21 + gray22) - (gray00 + 2.0*gray01 + gray02);
                float colorEdge = sqrt(colorGX * colorGX + colorGY * colorGY);

                // 3. Determinar si se dibuja borde negro
                float edge = 1.0;
                
                // Evitamos dibujar bordes en el cielo / fondo (donde la profundidad está cerca de 1.0)
                if (d11 < 0.999) {
                    // Si el cambio de profundidad es brusco (silueta) o hay alto contraste de color (detalle textura)
                    if (depthEdge > 0.003 || colorEdge > 0.15) {
                        edge = 0.0; // Multiplica por 0 para dejar la línea negra
                    }
                }

                // 4. Cuantizar el color de salida (Cel-shading plano)
                vec3 celColor = quantize(c11, 5.0);

                gl_FragColor = vec4(celColor * edge, 1.0);
            }
        `;
    }

    // 2. Activar el renderizador de profundidad en la escena para la cámara activa
    const depthRenderer = scene.enableDepthRenderer(camera);
    const depthMap = depthRenderer.getDepthMap();

    // 3. Instanciar el PostProcess
    const celShadingPP = new BABYLON.PostProcess(
        "CelShadingPostProcess",
        "celShading",
        ["screenSize"],
        ["depthSampler"],
        1.0,
        camera
    );

    // 4. Pasar uniformes en cada frame antes de aplicar el shader
    celShadingPP.onApply = (effect) => {
        effect.setTexture("depthSampler", depthMap);
        effect.setFloat2("screenSize", celShadingPP.width, celShadingPP.height);
    };

    return celShadingPP;
}
