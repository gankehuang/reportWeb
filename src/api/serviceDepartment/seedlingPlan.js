import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 月度投苗计划查询列表
 * @param data
 */
export function getSeedlingPlanParentList(data) {
  return request({
    url: `${baseUrl}/CtPlaYzRhSeedpl/selectAll/${data.pageSize}/${data.pageNum}`,
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
 * 月度投苗计划查询详情
 * @param data
 */
export function getSeedlingPlanParentDetails(data) {
  return request({
    url: `${baseUrl}/CtPlaYzRhSeedpl/selectByfparentid/${data.pageSize}/${data.pageNum}`,
    params: {
      fparentid: data.fparentid
    },
    method: 'get'
  })
}

/**
 * 审批月度投苗计划
 * @param data
 */
export function toExamine(data) {
  return request({
    url: `${baseUrl}/CtPlaYzRhSeedpl/audit`,
    data: {
      id: data.id
    },
    method: 'post'
  })
}

/**
 * 反审批月度投苗计划
 * @param data
 */
export function backToExamine(data) {
  return request({
    url: `${baseUrl}/CtPlaYzRhSeedpl/unaudit`,
    data: {
      id: data.id
    },
    method: 'post'
  })
}

