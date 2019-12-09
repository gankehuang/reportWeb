import store from '@/store'
import axios from 'axios'

export function getDwgViewUrl (ocfId, fileName) {
  const host = process.env.BASE_API.replace('http:', '')
  return `gstarcadwebview:${host}/BUILD/dwg?ssl=off&runmode=1&fileId=1001&fileName=view.dwg&cacheSize=1024&extData=${ocfId},${store.getters.token}&layout=application&lan=cn`
}

export function batchDownDwgFiles (fileIds, url, token) {
  return new Promise((resove, reject) => {
    axios({
      method: 'post',
      url: url,
      data: fileIds,
      responseType: 'arraybuffer',
      timeout: 1000 * 30,
      headers: {
        Authentication: token,
        filename:'utf-8'
      }
    }).then(res => {
      const fileStr = res.headers['content-disposition']
      const fileName = decodeURI(fileStr.substr(fileStr.indexOf('filename=')+9))
      let url = window.URL.createObjectURL(new Blob([res.data]))
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      document.body.appendChild(link)
      link.setAttribute('download', fileName)
      link.target = '_blank'
      link.click()
      resove()
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
    }).catch(error => {
      reject(error)
    })
  })

}


export  const debounce = (func, wait) => {
  let timeout = '';
  return (v) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(v);
    }, wait);
  }
}
