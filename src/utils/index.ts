// @ts-nocheck
export function debounce(func, wait, immediate?: boolean) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    // 据上一次触发时间间隔

    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args) {
    context = this;
    timestamp = +new Date();

    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时

    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);

      context = args = null;
    }

    return result;
  };
}

/**
 * 将URL查询字符串转换为对象。
 *
 * @param {string} url - 要解析的URL，默认为当前窗口的URL。
 * @returns {Object} - 一个键值对的对象，其中键和值都是字符串。
 */
export function paramToObj(url: string = window.location.href): { [key: string]: string } {
  // 解码URL并尝试分割以获取查询字符串部分。
  // 如果URL中没有查询字符串，则split('?')[1]将是undefined。
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ');

  if (!search) return {};

  const obj: { [key: string]: string } = {};

  const searchArr = search.split('&');

  searchArr.forEach((v) => {
    const index = v.indexOf('=');

    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });

  return obj;
}

/**
 * 获取URL中的查询参数。
 * @param {string} variable 要获取的查询参数的名称。
 * @returns {string} 查询参数的值或空字符串。
 */
export function getQuery(variable: string): string {
  // 获取当前URL中的查询字符串部分（即问号后面的部分）
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  // 遍历数组中的每个元素
  for (let i = 0; i < vars.length; i++) {
    // 把当前元素按照=符号分割成键和值
    const pair = vars[i].split('=');
    if (pair[0] == variable) return pair[1];
  }
  return '';
}

/**
 * Clears all items from localStorage except for the specified keys.
 *
 * @param {Array<string>} keysToKeep - An array of keys to keep in localStorage.
 *                                     All other keys will be removed.
 */
export function clearLocalStorageExcept(keysToKeep: string[] = []) {
  const allKeys = Object.keys(localStorage);
  const keysToRemove = allKeys.filter((key) => !keysToKeep.includes(key));
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Clears all items from sessionStorage except for the specified keys.
 *
 * @param {Array<string>} keysToKeep - An array of keys to keep in sessionStorage.
 *                                     All other keys will be removed.
 */
export function clearSessionStorageExcept(keysToKeep) {
  const allKeys = Object.keys(sessionStorage);
  const keysToRemove = allKeys.filter((key) => !keysToKeep.includes(key));
  keysToRemove.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

/**
 * 根据给定的值在字典数组中查找对应的颜色。
 *
 * @param {string} value - 要查找的值。
 * @param {Array} Dict - 包含字典项的数组，每个字典项应该是一个对象，包含 `value`  `text` `color` 属性。
 * @returns {string} - 返回匹配的字典项的 `color` 属性。如果没有找到匹配项，返回 '未知字典值'。
 *
 */
export function getDictColor(value, dict) {
  const item = dict.find((item) => item.value == value);
  return item ? item.color : undefined;
}

/**
 * 根据给定的文本在字典数组中查找对应的value。
 *
 * @param {string} text - 要查找的文本。
 * @param {Array} Dict - 包含字典项的数组，每个字典项应该是一个对象，包含 `value` 和 `text` 属性。
 * @returns {string} - 返回匹配的字典项的 `value` 属性。如果没有找到匹配项，返回 'undefind'。
 *
 */
export function getDictValue(text, dict) {
  const item = dict.find((item) => item.text == text);
  return item ? item.value : undefined;
}

/**
 * 根据给定的值在字典数组中查找对应的文本。
 *
 * @param {string} value - 要查找的值。
 * @param {Array} Dict - 包含字典项的数组，每个字典项应该是一个对象，包含 `value` 和 `text` 属性。
 * @returns {string} - 返回匹配的字典项的 `text` 属性。如果没有找到匹配项，返回 '未知字典值'。
 *
 */
export function getDictText(value, dict) {
  const item = dict.find((item) => item.value == value);
  return item ? item.text : '未知字典值';
}

/**
 * 加载地图脚本
 * @param  {string} src
 * @returns  {Promise}
 */
export function loadScript(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = () => {
      console.log('Script loaded successfully.');
      resolve();
    };
    script.onerror = () => {
      console.error('Error loading the script.');
      reject();
    };
    document.head.appendChild(script);
  });
}

/**
 * 检查当前时间与本地存储中的lastTime对比，如果超过限制时间则返回true，否则返回false
 *
 * @param {number} limitTime - 限制时间，单位为分钟，默认值为60分钟
 * @returns {boolean} - 如果当前时间大于 lastTime + limitTime 返回 true，否则返回 false
 */
export function checkExpire(limitTime: number = 60): boolean {
  const currentTime = Date.now();
  const lastTime = Number(localStorage.getItem('lastTime'));

  // 如果lastTime不存在，则认为已过期
  if (!lastTime) {
    localStorage.setItem('lastTime', String(currentTime));
    return true;
  }

  // 将限制时间从分钟转换为毫秒
  const limitInMilliseconds = limitTime * 60 * 1000;

  // 检查currentTime是否大于lastTime + limitInMilliseconds
  if (currentTime - lastTime > limitInMilliseconds) {
    localStorage.setItem('lastTime', String(currentTime)); // 更新lastTime为currentTime
    return true;
  }

  // 如果未超过限制时间，返回false
  return false;
}

/**
 * 下载文件
 * @param {File} file - 下载的文件对象
 * @returns {void}
 */
export function downloadFile(file: File) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(file);
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
