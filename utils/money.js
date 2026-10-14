/**
 * Extract a dollar amount from text such as "$29.99" or "Tax: $2.40" and
 * return it as integer cents, so totals can be compared without float error.
 * @param {string} text
 * @returns {number}
 */
function toCents(text) {
  const match = /\$(\d+)(?:\.(\d{2}))?/.exec(text);
  if (!match) throw new Error(`No dollar amount found in "${text}"`);
  return Number(match[1]) * 100 + Number(match[2] ?? 0);
}

module.exports = { toCents };
