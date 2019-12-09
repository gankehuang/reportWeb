import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 根据id查肥猪提级详情
 * @param id，pageSize,pageNum
 */
export function getById(id, pageSize, pageNum) {
  return request({
    url: `${baseUrl}/monoutplan/getMonoutPlanEntry/${id}/${pageSize}/${pageNum}`,
    method: 'get'
  })
}

/**
 * 肥猪提级列表
 * @param pageSize,pageNum
 */
export function queryList(pageSize, pageNum, query) {
  return request({
    url: `${baseUrl}/monoutplan/queryMonoutPlanList/${pageSize}/${pageNum}`,
    method: 'get',
    params: query
  })
}

/**
 * 根据id审核
 * @param data
 */
export function auditId(data) {
  return request({
    url: `${baseUrl}/monoutplan/auditUpdateStatus/${data}`,
    method: 'get'
  })
}

/**
 * 根据id反审核
 * @param data
 */
export function reverseAuditId(data) {
  return request({
    url: `${baseUrl}/monoutplan/unAuditUpdateStatus/${data}`,
    method: 'get'
  })
}
