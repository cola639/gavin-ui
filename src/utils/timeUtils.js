// timeUtils.js
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

/**
 * 1. 格式化时间
 * @param {string|number|Date|dayjs.Dayjs} input
 * @param {string} [format='YYYY-MM-DD HH:mm:ss']
 * @returns {string}
 */
export function formatDate(input, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!input) return '';
  const d = dayjs(input);
  return d.isValid() ? d.format(format) : '';
}

/**
 * 2. 解析字符串为 Date 对象
 * @param {string} input
 * @param {string} [format]
 * @returns {Date|null}
 */
export function parseDate(input, format) {
  if (!input) return null;
  const d = format ? dayjs(input, format) : dayjs(input);
  return d.isValid() ? d.toDate() : null;
}

/**
 * 3. 获取当前时间字符串
 * @param {string} [format='YYYY-MM-DD HH:mm:ss']
 * @returns {string}
 */
export function now(format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs().format(format);
}

/**
 * 4. 计算时间差（单位：秒/分/小时/天等）
 * @param {string|number|Date} start
 * @param {string|number|Date} end
 * @param {string} [unit='second']
 * @returns {number}
 */
export function diff(start, end, unit = 'second') {
  const s = dayjs(start);
  const e = dayjs(end);
  if (!s.isValid() || !e.isValid()) return 0;
  return e.diff(s, unit);
}

/**
 * 5. 时间是否在区间内（包含等于）
 * @param {string|number|Date} target
 * @param {string|number|Date} start
 * @param {string|number|Date} end
 * @returns {boolean}
 */
export function isBetween(target, start, end) {
  const t = dayjs(target);
  const s = dayjs(start);
  const e = dayjs(end);
  if (!t.isValid() || !s.isValid() || !e.isValid()) return false;
  return t.isSameOrAfter(s) && t.isSameOrBefore(e);
}

/**
 * 6. 是否为今天
 * @param {string|number|Date} input
 * @returns {boolean}
 */
export function isToday(input) {
  const d = dayjs(input);
  return d.isValid() && d.isSame(dayjs(), 'day');
}

/**
 * 7. 相对时间字符串（如：'2天前'/'刚刚'）
 * @param {string|number|Date} input
 * @returns {string}
 */
export function fromNow(input) {
  const d = dayjs(input);
  return d.isValid() ? d.fromNow() : '';
}

/**
 * 8. 获取本周/上周/下周的开始与结束
 * @param {string|number|Date} [input]
 * @param {number} [addWeek=0] 0本周, -1上周, 1下周
 * @returns {{start: string, end: string}}
 */
export function getWeekRange(input, addWeek = 0) {
  let d = input ? dayjs(input) : dayjs();
  if (!d.isValid()) d = dayjs();
  const weekStart = d.add(addWeek, 'week').startOf('week').format('YYYY-MM-DD');
  const weekEnd = d.add(addWeek, 'week').endOf('week').format('YYYY-MM-DD');
  return { start: weekStart, end: weekEnd };
}

/**
 * 9. 增加/减少时间
 * @param {string|number|Date} input
 * @param {number} amount
 * @param {string} unit 'day'|'month'|'year'|'hour'|'minute'|'second'
 * @returns {string}
 */
export function addTime(input, amount, unit = 'day') {
  const d = dayjs(input);
  if (!d.isValid() || typeof amount !== 'number') return '';
  return d.add(amount, unit).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 10. 获取时间戳（毫秒）
 * @param {string|number|Date} input
 * @returns {number}
 */
export function getTimestamp(input) {
  const d = dayjs(input);
  return d.isValid() ? d.valueOf() : 0;
}
