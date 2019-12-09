import Vue from 'vue'

/**
 * link: https://www.cnblogs.com/luyuefeng/p/9857480.html
 */

/**
 * @method formatJson
 * @param {Array} filterVal 导出表头的中文表头对应的英文名称
 * 例:['name', 'age']
 * @param {Array} jsonData 导出的数据
 * 例:[{
 *      name: '张三',
 *      age: 14
 *    }]
 * @return {Array} 组装成需要导出的excel数据
 */
let formatJson = (filterVal, jsonData) => {
  return jsonData.map(v => filterVal.map(j => v[j]))
}

/**
 * @method dateTransition
 * @param {Array} outdata excel表导入的数据
 * 例:[{
 *      姓名: '张三',
        年龄: 14
 *    }]
 * @param {Array} importModel excel表头中文名称和其对应的英文名称
 * 例:[{
 *      label: '姓名',
 *      value: 'name'
 *    },{
 *      label: '年龄',
 *      value: 'age'
 *    }]
 * @return {Array} 组装成需要导入的excel数据
 */
let dateTransition = (outdata, importModel) => {
  console.log('outdata', outdata)
  console.log('importModel', importModel)
  let importData = []
  for (let item of outdata) {
    let obj = {}
    for (let key in item) {
      for (let childItem of importModel) {
        if (key === childItem.label) {
          obj[childItem.value] = item[key]
          break
        }
      }
    }
    importData.push(obj)
  }
  return importData
}

/**
 * @method $exportExcel
 * @param {Array} tHeader 导出表格的中文表头
 * 例:['姓名', '年龄']
 * @param {Array} filterVal 导出表头的中文表头对应的英文名称
 * 例:['name', 'age']
 * @param {Array} exportList 导出的数据
 * 例:[{
 *      name: '张三',
 *      age: 14
 *    }]
 * @param {String} excelName 导出的excel表格名称
 * @return {null} 无返回值
 */
Vue.prototype.$exportExcel = (tHeader, filterVal, exportList, excelName) => {
  require.ensure([], () => {
    const { export_json_to_excel } = require('@/vendor/Export2Excel')　　// 引入文件
    tHeader.unshift('序号')
    filterVal.unshift('index')
    for (let i = 0; i < exportList.length; i++) {
      exportList[i].index = i + 1 + ''
    }
    const data = formatJson(filterVal, exportList)
    console.log('data', data)
    export_json_to_excel(tHeader, data, excelName)
  })
}

/**
 * @method $importExcel
 * @param {Object} event 文件表单触发change事件的event对象
 * @param {Array} importModel excel表头中文名称和其对应的英文名称
 * 例:[{
 *      label: '姓名',
 *      value: 'name'
 *    },{
 *      label: '年龄',
 *      value: 'age'
 *    }]
 * @return {null} 无返回值
 */
// 导入
Vue.prototype.$importExcel = (event, importModel) => {
  return new Promise((resolve, reject) => {
    var f = event.currentTarget.files[0]
    var rABS = false // 是否将文件读取为二进制字符串

    var reader = new FileReader()
    FileReader.prototype.readAsBinaryString = function (f) {
      var binary = ''
      var rABS = false // 是否将文件读取为二进制字符串
      var pt = this
      var wb // 读取完成的数据
      var outdata
      var reader = new FileReader()
      reader.onload = function (e) {
        var bytes = new Uint8Array(reader.result)
        var length = bytes.byteLength
        for (var i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        var XLSX = require('xlsx')

        if (rABS) {
          wb = XLSX.read(btoa(fixdata(binary)), { // 手动转化
            type: 'base64'
          })
        } else {
          wb = XLSX.read(binary, {
            type: 'binary'
          })
        }
        outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        let importList = dateTransition(outdata, importModel)
        resolve(importList)
      }
      reader.readAsArrayBuffer(f)
    }
    if (rABS) {
      reader.readAsArrayBuffer(f)
    } else {
      reader.readAsBinaryString(f)
    }
  })
}

export function exportExcel(header, filterVal, exportList, filename){
  header.unshift('序号')
  filterVal.unshift('index')
  for (let i = 0; i < exportList.length; i++) {
    exportList[i].index = i + 1 + ''
  }
  import('@/vendor/Export2Excel').then(excel => {
    const data = formatJson(filterVal, exportList)
    excel.export_json_to_excel({
      header,
      data,
      filename
    })
  })
}