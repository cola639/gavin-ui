// collectionUtils.js

/**
 * 1. 对象数组某字段求和
 * @param {Array} arr
 * @param {string} field
 * @returns {number}
 */
export function sumBy(arr, field) {
  if (!Array.isArray(arr) || !field) return 0;
  return arr.reduce((sum, item) => sum + (Number(item?.[field]) || 0), 0);
}

/**
 * 2. 根据某字段去重
 * @param {Array} arr
 * @param {string} field
 * @returns {Array}
 */
export function uniqueBy(arr, field) {
  if (!Array.isArray(arr) || !field) return [];
  const seen = new Set();
  return arr.filter(item => {
    const key = item?.[field];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 3. 数组去重（简单值类型）
 * @param {Array} arr
 * @returns {Array}
 */
export function unique(arr) {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr));
}

/**
 * 4. 对象数组根据某字段升/降序排序
 * @param {Array} arr
 * @param {string} field
 * @param {'asc'|'desc'} [order='asc']
 * @returns {Array}
 */
export function sortBy(arr, field, order = 'asc') {
  if (!Array.isArray(arr) || !field) return [];
  const sorted = [...arr].sort((a, b) => (a?.[field] || 0) - (b?.[field] || 0));
  return order === 'desc' ? sorted.reverse() : sorted;
}

/**
 * 5. 分组（groupBy）
 * @param {Array} arr
 * @param {string|function} fieldOrFn
 * @returns {Object}
 */
export function groupBy(arr, fieldOrFn) {
  if (!Array.isArray(arr)) return {};
  const fn = typeof fieldOrFn === 'function' ? fieldOrFn : (item) => item?.[fieldOrFn];
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/**
 * 6. 求交集
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Array}
 */
export function intersection(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
}

/**
 * 7. 求差集（arr1 有而 arr2 没有的）
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Array}
 */
export function difference(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
}




/**
 * 8. 获取对象数组某字段的最大值
 * @param {Array} arr
 * @param {string} field
 * @returns {number}
 */
export function maxBy(arr, field) {
  if (!Array.isArray(arr) || !field) return 0;
  return Math.max(...arr.map(item => Number(item?.[field]) || 0));
}

/**
 * 9. 获取对象数组某字段的最小值
 * @param {Array} arr
 * @param {string} field
 * @returns {number}
 */
export function minBy(arr, field) {
  if (!Array.isArray(arr) || !field) return 0;
  return    Math.min(...arr.map(item => Number(item?.[field]) || 0));
}

/**
 * 10. 扁平化多维数组
 * @param {Array} arr
 * @returns {Array}
 */
export function flatten(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.flat(Infinity);
}
