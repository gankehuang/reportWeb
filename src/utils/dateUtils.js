const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
import moment from 'moment'

const timeToEng = function(time) {
  const date = new Date(time)
  return months[date.getMonth()]
}
const timeFormat = function(time, fmt) {
  if (time === undefined || time === null) {
    return '无'
  }
  var date = new Date()

  date.setTime(time)
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  }
  return fmt
}

const dateFormat = function (date, fmt) {
  if (date === undefined || date === null) {
    return null
  }
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  }
  return fmt
}
// 限制输入框只能输入数字和小数
export function inputLimitNum(e, num) {
  if (!num) { //正整数
    return e.target.value.replace(/[^0-9]+/g, '');
  } else {
    let re = new RegExp("^\\d*(\\.?\\d{0," + num + "})", "g");
    return (e.target.value.match(re)[0]) || null;
  }

}

export function anyTypeDateFormat (date, format = 'YYYY-MM-DD') {
  if (!date) return

  if (date instanceof Date){
    return moment(date).format(format)
  } else if (!isNaN(date)) { // 时间戳
    return moment(parseInt(date)).format(format)
  }  else if (date instanceof String && (/^\d{4}-\d{2}-\d{2}$/).test(date)) {
    return date
  }
}


export { timeToEng, timeFormat, dateFormat }
