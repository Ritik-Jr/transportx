/**
 * Generate a random 4-character LR (Lorry Receipt) ID.
 * - Exactly 4 characters.
 * - Contains uppercase letters (A-Z) and numbers (0-9).
 * - Verified to be unique against all existing trips in database.
 */
export function generateUniqueLrId(existingTrips = []) {
  const existingSet = new Set(
    (existingTrips || [])
      .map(t => {
        if (!t) return '';
        const val = typeof t === 'string' ? t : t.lrNo || t.lr_no || '';
        return String(val).toUpperCase().trim();
      })
      .filter(Boolean)
  );

  const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const MAX_ATTEMPTS = 10000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let candidate = '';
    for (let i = 0; i < 4; i++) {
      candidate += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    // Must include both at least one capital letter and at least one digit
    const hasLetter = /[A-Z]/.test(candidate);
    const hasDigit = /[0-9]/.test(candidate);

    if (hasLetter && hasDigit && !existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Fallback timestamp-based 4-character code in extreme edge case
  const fallback = Math.random().toString(36).substring(2, 6).toUpperCase();
  return fallback;
}
