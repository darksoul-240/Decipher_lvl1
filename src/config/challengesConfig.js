// ─── Time-Gated Cryptographic Gauntlet — Challenge Configuration ───

const ACTIVE_SLOT_KEY = 'gauntlet_active_slot';

export const CHALLENGES_CONFIG = [
  {
    id: 0,
    title: 'CIPHER BREACH',
    level: 'SEC-LEVEL α',
    icon: '◈',
    accent: '#00f0ff',
    threat: 'LOW',
    description: 'Decode the encrypted signal to bypass the outer firewall.',
    vigenereKey: 'ENIGMA',
    plaintext:
      'THE INTERCEPTED SIGNAL WEARS A MASK WHAT YOU SEE IS NOT WHAT IT MEANS THIS ENCODING SPEAKS IN AN ALPHABET OF SIXTY FOUR CHARACTERS LETTERS BOTH GREAT AND SMALL DIGITS AND TWO SYMBOLS MORE UNMASK THE PAYLOAD TO REVEAL A PASSAGE WITH GAPS SEEK THE MISSING WORDS IN THE DECLARATION OF INDEPENDENCE',
    bookLink: {
      title: 'Declaration of Independence',
      url: 'https://www.archives.gov/founding-docs/declaration-transcript',
    },
    base64Clue: {
      // Raw text that gets Base64-encoded and shown to the user
      raw: '[INTERCEPTED DOCUMENT FRAGMENT]\n\n"We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are _____, _____ and the _____ of Happiness."\n\n// SOURCE: Declaration of Independence - Preamble\n// DIRECTIVE: Enter the 3 missing words as your passphrase (space-separated)',
    },
    solution: 'LIFE LIBERTY PURSUIT',
  },
  {
    id: 1,
    title: 'QUANTUM LOCK',
    level: 'SEC-LEVEL β',
    icon: '◇',
    accent: '#39ff14',
    threat: 'MEDIUM',
    description: 'Navigate quantum-encrypted pathways to reach the core.',
    vigenereKey: 'HAL9000',
    plaintext:
      'QUANTUM PATHWAY RESOLVED COORDINATES TWO FOUR ONE FIVE NINE THREE EXTRACT WORDS FROM APOLLO ELEVEN FLIGHT JOURNAL SUBMIT PASSPHRASE TO ADVANCE',
    bookLink: {
      title: 'NASA Apollo 11 Flight Journal',
      url: 'https://history.nasa.gov/afj/ap11fj/index.html',
    },
    coordinates: ['2-4-1', '5-9-3'],
    solution: 'EAGLE TRANQUILITY',
  },
  {
    id: 2,
    title: 'NEURAL MAZE',
    level: 'SEC-LEVEL γ',
    icon: '⬡',
    accent: '#ffae00',
    threat: 'HIGH',
    description: 'Infiltrate the neural network defense grid.',
    vigenereKey: 'TURING',
    plaintext:
      'NEURAL GRID BREACHED COORDINATES SEVEN THREE FIVE ONE SIX TWO FIND THE MARKED WORDS IN THE ENIGMA ARCHIVES AT BLETCHLEY ENTER DECODED PASSPHRASE',
    bookLink: {
      title: 'The Enigma Machine — Bletchley Park Archives',
      url: 'https://www.bletchleypark.org.uk/our-story/enigma',
    },
    coordinates: ['7-3-5', '1-6-2'],
    solution: 'COLOSSUS BOMBE',
  },
  {
    id: 3,
    title: 'ZERO-DAY',
    level: 'SEC-LEVEL Ω',
    icon: '◆',
    accent: '#ff073a',
    threat: 'CRITICAL',
    description: 'Exploit the final vulnerability. No second chances.',
    vigenereKey: 'CIPHER',
    plaintext:
      'ZERO DAY EXPLOIT ACTIVE COORDINATES THREE ONE SEVEN EIGHT FOUR TWO RETRIEVE PASSPHRASE FROM THE ART OF WAR ANCIENT TEXT SUBMIT FINAL ANSWER NOW',
    bookLink: {
      title: 'The Art of War — Sun Tzu (Project Gutenberg)',
      url: 'https://www.gutenberg.org/files/132/132-h/132-h.htm',
    },
    coordinates: ['3-1-7', '8-4-2'],
    solution: 'DECEPTION VICTORY',
  },
];

/**
 * Get the currently active (unlocked) challenge id.
 * Returns the id stored in localStorage, or -1 if none is set (all locked).
 */
export function getActiveSlotId() {
  const stored = localStorage.getItem(ACTIVE_SLOT_KEY);
  if (stored === null) return -1; // no challenge unlocked by default
  const id = parseInt(stored, 10);
  return isNaN(id) ? -1 : id;
}

/**
 * Set which challenge is unlocked.
 * Pass the challenge id (0–3) to unlock it, or -1 to lock all.
 */
export function setActiveSlotId(id) {
  if (id === -1 || id === null) {
    localStorage.removeItem(ACTIVE_SLOT_KEY);
  } else {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(id));
  }
}

/**
 * Check if a specific challenge is currently unlocked.
 */
export function isChallengeUnlocked(challengeId) {
  return getActiveSlotId() === challengeId;
}
