// mathUtils.js

/**
 * 1. 获取百分比
 * @param {number|string} count - 分子
 * @param {number|string} total - 分母
 * @param {number} [precise=2] - 小数点精度
 * @returns {string} 百分比字符串, 如 "23.50%"
 */
export function getPercent(count, total, precise = 2) {
  const n = Number(count);
  const d = Number(total);
  const p = Number(precise);
  if (isNaN(n) || isNaN(d) || d === 0) return '0%';
  return ((n / d) * 100).toFixed(isNaN(p) ? 2 : p) + '%';
}

/**
 * 2. 判断是否为奇数
 * @param {number|string} value
 * @returns {boolean}
 */
export function isOdd(value) {
  const n = Number(value);
  if (isNaN(n)) return false;
  return n % 2 === 1 || n % 2 === -1;
}

/**
 * 3. 判断是否为偶数
 * @param {number|string} value
 * @returns {boolean}
 */
export function isEven(value) {
  const n = Number(value);
  if (isNaN(n)) return false;
  return n % 2 === 0;
}

/**
 * 4. 获取区间内的随机整数 [min, max]
 * @param {number|string} min
 * @param {number|string} max
 * @returns {number}
 */
export function randomInt(min, max) {
  const a = Math.ceil(Number(min));
  const b = Math.floor(Number(max));
  if (isNaN(a) || isNaN(b) || a > b) return 0;
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

/**
 * 5. 保留指定位数的小数
 * @param {number|string} value
 * @param {number} [digits=2]
 * @returns {number}
 */
export function toFixedNum(value, digits = 2) {
  const n = Number(value);
  const d = Number(digits);
  if (isNaN(n)) return 0;
  return Number(n.toFixed(isNaN(d) ? 2 : d));
}

/**
 * 6. 求和
 * @param {Array<number|string>} arr
 * @returns {number}
 */
export function sum(arr) {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, cur) => acc + (Number(cur) || 0), 0);
}

/**
 * 7. 求平均数
 * @param {Array<number|string>} arr
 * @param {number} [precise=2]
 * @returns {number}
 */
export function average(arr, precise = 2) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return toFixedNum(sum(arr) / arr.length, precise);
}

/**
 * 8. 求最大值
 * @param {Array<number|string>} arr
 * @returns {number}
 */
export function max(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return Math.max(...arr.map(Number));
}

/**
 * 9. 求最小值
 * @param {Array<number|string>} arr
 * @returns {number}
 */
export function min(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return Math.min(...arr.map(Number));
}

/**
 * 10. 四舍五入到任意精度
 * @param {number|string} value
 * @param {number} [digits=0]
 * @returns {number}
 */
export function round(value, digits = 0) {
  const n = Number(value);
  const d = Number(digits);
  if (isNaN(n)) return 0;
  const factor = Math.pow(10, isNaN(d) ? 0 : d);
  return Math.round(n * factor) / factor;
}
