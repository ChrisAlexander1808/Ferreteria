// utils/token.js
const crypto = require('crypto');

/**
 * Genera un token seguro para confirmaciones, reseteo de contraseñas, etc.
 * @returns {string} token seguro de 64 caracteres
 */
function generarToken() {
  return crypto.randomBytes(32).toString('hex'); // 64 chars hex
}

module.exports = { generarToken };
