import moment from 'moment';
moment.defineLocale('zh-cn', {
  relativeTime: {
    future: '%s内',

    past: '%s前',

    s: '几秒',

    m: '1 分钟',

    mm: '%d 分钟',

    h: '1 小时',

    hh: '%d 小时',

    d: '1 天',

    dd: '%d 天',

    M: '1 个月',

    MM: '%d 个月',

    y: '1 年',

    yy: '%d 年'
  }
});

/**
 * 获取当前时间戳
 */
export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Converts a date string to a Unix timestamp (in seconds).
 *
 * @param dateString - The date string to convert. Expected format: 'YYYY-MM-DD HH:mm:ss' '2024-07-03 14:02:18'.
 * @returns The Unix timestamp corresponding to the provided date string.
 */
export function convertToTimestamp(dateString: string): number {
  // 创建一个 Date 对象
  const date = new Date(dateString);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string format');
  }

  // 获取 Unix 时间戳（毫秒）
  const timestamp = date.getTime();

  // 将毫秒时间戳转换为秒时间戳
  return Math.floor(timestamp / 1000);
}

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time
        .replace(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replace(new RegExp(/\.[\d]{3}/gm), '');
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return time_str;
}

export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  //@ts-ignore
  const diff = (now - d) / 1000;

  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分';
  }
}

/**
 * Formats a date string to a relative time description using moment.js.
 *
 * @param dateString - The date string to format.
 * @returns A relative time description or an exact date if more than a year ago.
 */
export function momentFormatTime(dateString: string): string {
  const timestamp = convertToTimestamp(dateString) * 1000; // 转换为毫秒
  const now = moment().locale('zh-cn');
  const date = moment(timestamp);

  if (now.diff(date, 'years') >= 1) {
    return date.format('YYYY-MM-DD');
  } else {
    return date.fromNow();
  }
}
