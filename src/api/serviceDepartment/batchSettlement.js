import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 批次结算查询列表
 * @param data
 */
export function getBatchSettlementList(data) {
  return request({
    url: `${baseUrl}/Costplanning/selectAll/${data.pageSize}/${data.pageNum}`,
    data: {
      orgid: data.orgid,
      cfyear: data.cfyear,
      cfmonth: data.cfmonth,
      cfyearmonth: data.cfyear + '-' + data.cfmonth
    },
    method: 'post'
  })
}

/**
 * 批次结算查询详情
 * @param data
 */
export function getBatchSettlementDetails(data) {
  return request({
    url: `${baseUrl}/Costplanning/selectByfparentid/${data.pageSize}/${data.pageNum}`,
    params: {
      fparentid: data.fparentid
    },
    method: 'get'
  })
}

/**
 * 审批批次结算
 * @param data
 */
export function toExamine(data) {
  return request({
    url: `${baseUrl}/Costplanning/audit`,
    data: {
      id: data.id
    },
    method: 'post'
  })
}

/**
 * 反审批批次结算
 * @param data
 */
export function backToExamine(data) {
  return request({
    url: `${baseUrl}/Costplanning/unaudit`,
    data: {
      id: data.id
    },
    method: 'post'
  })
}
