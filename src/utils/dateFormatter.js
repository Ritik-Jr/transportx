/**
 * Strict DD/MM/YYYY date formatting utility for TransportX.
 * Formats ISO strings (YYYY-MM-DD), Date objects, timestamps,
 * and handles any arbitrary date input gracefully.
 */
export function formatDate(val, fallback = '—') {
  if (!val) return fallback;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return fallback;

    // Already DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Direct YYYY-MM-DD match (e.g. "2026-11-05" or "2026-11-05T...")
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, '0');
      const day = ymdMatch[3].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }

    // Direct DD-MM-YYYY match
    const dmyMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${day}/${month}/${year}`;
    }
  }

  try {
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return fallback;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return fallback;
  }
}
