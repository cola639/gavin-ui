// stringUtils.js

/**
 * 1. 首字母大写
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 2. 全部转小写
 * @param {string} str
 * @returns {string}
 */
export function toLower(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase();
}

/**
 * 3. 全部转大写
 * @param {string} str
 * @returns {string}
 */
export function toUpper(str) {
  if (typeof str !== 'string') return '';
  return str.toUpperCase();
}

/**
 * 4. 去除所有空格（包括中间空格）
 * @param {string} str
 * @returns {string}
 */
export function removeAllSpaces(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\s+/g, '');
}

/**
 * 5. 去除两端空格
 * @param {string} str
 * @returns {string}
 */
export function trim(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

/**
 * 6. 字符串截断（超出用...表示）
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength) {
  if (typeof str !== 'string') return '';
  if (typeof maxLength !== 'number' || maxLength <= 0) return str;
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

/**
 * 7. 驼峰转下划线
 * @param {string} str
 * @returns {string}
 */
export function camelToSnake(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 8. 下划线转驼峰
 * @param {string} str
 * @returns {string}
 */
export function snakeToCamel(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
}

/**
 * 9. 隐藏字符串（常用于手机号、邮箱中间加*，可自定义规则）
 * @param {string} str
 * @param {number} start - 前面保留几位
 * @param {number} end - 末尾保留几位
 * @returns {string}
 */
export function mask(str, start = 3, end = 4) {
  if (typeof str !== 'string') return '';
  if (str.length <= start + end) return str;
  return str.slice(0, start) + '*'.repeat(str.length - start - end) + str.slice(-end);
}

/**
 * 10. 检查字符串是否为空/全是空白
 * @param {string} str
 * @returns {boolean}
 */
export function isBlank(str) {
  return typeof str !== 'string' || str.trim().length === 0;
}
