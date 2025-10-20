// formatJs.js

/**
 * 1. Smartly display numbers; show '-' if empty or invalid
 * @param {number|string} val
 * @returns {string}
 * @example
 *   formatNumber(123)        // '123'
 *   formatNumber('45')       // '45'
 *   formatNumber(null)       // '-'
 *   formatNumber('abc')      // '-'
 */
export function formatNumber(val, defaultVal = '-') {
  if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
    return defaultVal;
  }
  return String(val);
}

/**
 * 2. Format numbers with units, e.g. 1200 => 1.2k
 * @param {number} num
 * @param {string[]} units - Default ['', 'k', 'M', 'B']
 * @param {number} [precision=1]
 * @returns {string}
 * @example
 *   formatUnit(1200)            // '1.2k'
 *   formatUnit(9999999)         // '10M'
 *   formatUnit(56)              // '56'
 *   formatUnit(null)            // '-'
 */
export function formatUnit(num, units = ['', 'k', 'M', 'B'], precision = 1) {
  if (typeof num !== 'number' || isNaN(num)) return '-';
  let absNum = Math.abs(num);
  let unitIndex = 0;
  while (absNum >= 1000 && unitIndex < units.length - 1) {
    absNum = absNum / 1000;
    unitIndex++;
  }
  const value = (num / Math.pow(1000, unitIndex)).toFixed(precision);
  return value.replace(/\.0+$/, '') + units[unitIndex];
}

/**
 * 3. Format number with thousand separators
 * @param {number|string} num
 * @returns {string}
 * @example
 *   formatThousand(1234567)     // '1,234,567'
 *   formatThousand('987654321') // '987,654,321'
 *   formatThousand(null)        // '-'
 */
export function formatThousand(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '-';
  return Number(num).toLocaleString();
}

/**
 * 4. Format as percentage
 * @param {number|string} val
 * @param {number} [precision=2]
 * @returns {string}
 * @example
 *   formatPercent(0.1234)       // '12.34%'
 *   formatPercent('0.5', 0)     // '50%'
 *   formatPercent(null)         // '-'
 */
export function formatPercent(val, precision = 2) {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return (Number(val) * 100).toFixed(precision) + '%';
}

/**
 * 5. Keep fixed decimals (pad with zero if needed)
 * @param {number|string} val
 * @param {number} [precision=2]
 * @returns {string}
 * @example
 *   formatFixed(1.2, 3)         // '1.200'
 *   formatFixed('3.14159', 2)   // '3.14'
 *   formatFixed(null)           // '-'
 */
export function formatFixed(val, precision = 2) {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return Number(val).toFixed(precision);
}

/**
 * 6. Money formatting, auto add thousand separator and unit (ten-thousand/million)
 * @param {number|string} num
 * @returns {string}
 * @example
 *   formatMoney(12345678)       // '1.23B'
 *   formatMoney(12000)          // '1.20W'
 *   formatMoney(100)            // '100'
 *   formatMoney(null)           // '-'
 */
export function formatMoney(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '-';
  const n = Number(num);
  if (n >= 1e8) return (n / 1e8).toFixed(2) + 'B';
  if (n >= 1e4) return (n / 1e4).toFixed(2) + 'W';
  return n.toLocaleString();
}
