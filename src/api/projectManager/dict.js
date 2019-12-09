import request from '@/utils/request'

/**
 * 获取字典项
 * @param url
 * @param params
 * @param method
 */
export function getDict(url,params,method = 'get') {
  return request({
    url: `${url}`,
    method: method,
    params: params,
    data: params
  })

}