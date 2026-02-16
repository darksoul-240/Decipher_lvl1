// ─── Vigenère Cipher Utilities ───

/**
 * Encrypt plaintext using Vigenère cipher.
 * Only alphabetic characters are shifted; spaces/punctuation pass through unchanged.
 * Non-alpha characters in the key are stripped before use.
 */
export function vigenereEncrypt(plaintext, key) {
  const keyAlpha = key.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (keyAlpha.length === 0) return plaintext;

  let result = '';
  let ki = 0;

  for (const char of plaintext) {
    if (/[A-Za-z]/.test(char)) {
      const base = char === char.toUpperCase() ? 65 : 97;
      const shift = keyAlpha.charCodeAt(ki % keyAlpha.length) - 65;
      result += String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
      ki++;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Decrypt ciphertext using Vigenère cipher.
 */
export function vigenereDecrypt(ciphertext, key) {
  const keyAlpha = key.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (keyAlpha.length === 0) return ciphertext;

  let result = '';
  let ki = 0;

  for (const char of ciphertext) {
    if (/[A-Za-z]/.test(char)) {
      const base = char === char.toUpperCase() ? 65 : 97;
      const shift = keyAlpha.charCodeAt(ki % keyAlpha.length) - 65;
      result += String.fromCharCode(((char.charCodeAt(0) - base - shift + 26) % 26) + base);
      ki++;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Check if the given key matches the expected key (case-insensitive, trimmed).
 */
export function validateKey(input, expectedKey) {
  return input.trim().toUpperCase() === expectedKey.trim().toUpperCase();
}
