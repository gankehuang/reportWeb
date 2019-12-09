// 基准大小
const baseSize = 16
var tid;
// 设置 rem 函数
function setRem() {
    const scale = document.documentElement.clientWidth / 1920
    // 设置页面根节点字体大小
    document.documentElement.style.fontSize = (baseSize * Math.min(scale, 1)) + 'px'
}

// 初始化
setRem()
// 改变窗口大小时重新设置 rem
window.onresize = function() {
    setRem()
}

// window.addEventListener('resize', function() {
//   clearTimeout(tid);
//   tid = setTimeout(setRem, 300);
// }, false);
// window.addEventListener('pageshow', function(e) {
//   if (e.persisted) {
//     clearTimeout(tid);
//     tid = setTimeout(setRem, 300);
//   }
// }, false);