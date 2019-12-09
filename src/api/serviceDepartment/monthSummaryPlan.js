import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 根据id查详情
 * @param data
 */
export function getById(data, pageSize, pageNum) {
  return request({
    url: `${baseUrl}/divisionMonthlyPlanBill/getDivisionMpbe/${data}/${pageSize}/${pageNum}`,
    method: 'get'
  })
}

/**
 * 列表
 * @param data
 */
export function queryList(pageSize, pageNum, query) {
  return request({
    url: `${baseUrl}/divisionMonthlyPlanBill/queryDivisionMonthlyPlanList/${pageSize}/${pageNum}`,
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
    url: `${baseUrl}/divisionMonthlyPlanBill/auditUpdateStatus/${data}`,
    method: 'get'
  })
}

/**
 * 根据id反审核
 * @param data
 */
export function reverseAuditId(data) {
  return request({
    url: `${baseUrl}/divisionMonthlyPlanBill/unAuditUpdateStatus/${data}`,
    method: 'get'
  })
}
