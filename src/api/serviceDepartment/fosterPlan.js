import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 养户开发计划查询列表
 * @param data
 */
export function getFosterPlanList(data) {
  return request({
    url: `${baseUrl}/CtPlaYzrhMonpl/selectAll/${data.pageSize}/${data.pageNum}`,
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
 * 养户开发计划查询详情
 * @param data
 */
export function getFosterPlanListDetails(data) {
  return request({
    url: `${baseUrl}/CtPlaYzrhMonpl/selectByfparentid/${data.pageSize}/${data.pageNum}`,
    params: {
      fparentid: data.fparentid
    },
    method: 'get'
  })
}

/**
 * 审批养户开发计划
 * @param data
 */
export function toExamine(data) {
  return request({
    url: `${baseUrl}/CtPlaYzrhMonpl/audit`,
    data: {
      id: data.id
    },
    method: 'post'
  })
}

/**
 * 反审批养户开发计划
 * @param data
 */
export function backToExamine(data) {
  return request({
    url: `${baseUrl}/CtPlaYzrhMonpl/unaudit`,
    data: {
      id: data.id
    },
    method: 'post'
  })
}
