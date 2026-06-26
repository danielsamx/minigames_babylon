/**
 * Funciones de utilidad general y auxiliares para el proyecto.
 */

/**
 * Genera un número aleatorio decimal entre min (inclusive) y max (exclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Convierte un color Hexadecimal (#RRGGBB) a una estructura Color3 de Babylon.
 * @param {string} hex
 * @returns {BABYLON.Color3}
 */
export function hexToColor3(hex) {
    return BABYLON.Color3.FromHexString(hex);
}
