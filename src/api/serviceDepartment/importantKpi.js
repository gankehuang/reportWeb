import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 提交
 * @param data
 */
export function submitData(data) {
  return request({
    url: `${baseUrl}/performanceAnalysis/insertOrUpdate`,
    method: 'post',
    data
  })
}

/**
 * 列表
 * @param data
 */
export function queryList(query) {
  return request({
    url: `${baseUrl}/performanceAnalysis/find`,
    method: 'get',
    params: query
  })
}

/**
 * 根据id审核
 * @param data
 */
export function auditData(data) {
  return request({
    url: `${baseUrl}/performanceAnalysis/approve`,
    method: 'post',
    data
  })
}

/**
 * 导入
 * @param data
 */
export function importReport(projectId,data) {
  return request(
    {
      url: `${baseUrl}/performanceAnalysisEntry/importExcelByList/${projectId} `,
      method: 'post',
      data
    }
  )
}

