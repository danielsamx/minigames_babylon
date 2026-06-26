/**
 * Utilidades matemáticas complementarias.
 */

/**
 * Limita un valor numérico entre los límites mínimos y máximos dados.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Interpolación lineal simple entre dos números (lerp).
 * @param {number} start
 * @param {number} end
 * @param {number} amt
 * @returns {number}
 */
export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}
