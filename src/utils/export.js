import axios from 'axios'
import { getToken } from '@/utils/auth'
// 导出Excel公用方法id
export function exportMethod(data) {
    axios({
        method: data.method,
        url: `${process.env.BASE_API}/BUSINESSREPORT/${data.url}/${data.params}`,
        responseType: 'blob',
        timeout: 1000 * 30,
        headers: {
            Authentication: `${getToken()}`,
            filename:'utf-8'
        }
    }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.fileName+'.xlsx');
        document.body.appendChild(link);
        link.click();
    }).catch(function(reason) {
      console.log('catch:', reason);
     });
}

// 导出Excel公用方法对象
export function exportMethods(data) {
    axios({
        method: data.method,
        url: `${process.env.BASE_API}/BUSINESSREPORT/${data.url}`,
        params:data.params,
        responseType: 'blob',
        timeout: 1000 * 30,
        headers: {
            Authentication: `${getToken()}`,
            filename:'utf-8'
        }
    }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.fileName+'.xlsx');
        document.body.appendChild(link);
        link.click();
    }).catch(function(reason) {
      console.log('catch:', reason);
     });
}

export function exportReport(data) {  // 导出报表
  let requestData = {
    method: data.method,
    url: `${process.env.BASE_API}/BUSINESSREPORT/${data.url}`,
    responseType: 'blob',
    timeout: 1000 * 30,
    headers: {
      Authentication: `${getToken()}`,
      filename:'utf-8'
    }
  };

  let method = data.method.toLowerCase();
  if (method === 'get' && data.params) {
    requestData.params = data.params
  }else if (method === 'post' && data.data) {
    requestData.data = data.data
  }

  axios(requestData).then(response => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', data.fileName+'.xlsx');
    document.body.appendChild(link);
    link.click();
  }).catch(function(reason) {
    console.log('catch:', reason);
  });
}

