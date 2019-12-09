import request from '@/utils/request'
import baseUrl from './baseApiUrl'

/**
 * 获取组织树
 * @param data
 */
export function getOrgTree(data) {
  return request({
    url: `${baseUrl}/orgSpRecord/getOrgTree`,
    method: 'post',
    data: {
      id: data.id,
      longNumber: data.longNumber,
      name: data.name,
      parentId: data.parentId,
      type: data.type
    }
  })
}

/**
 *
 * 保存判断报表是否可进行反审核记录
 * @param data
 */
export function saveOrgSpRecord(data) {
  return request({
    url: `${baseUrl}/orgSpRecord/save`,
    method: 'get',
    params: data
  })
}

/**
 *
 * 判断父级是否可显示确认按钮
 * @param data
 */
export function checkIsShowButton(data) {
  return request({
    url: `${baseUrl}/orgSpRecord/checkIsShowButton`,
    method: 'get',
    params: data
  })
}

/**
 *
 * 根据组织ID和日期获取所有报表信息
 * @param data
 */
export function getReportList(data) {
  return request({
    url: `${baseUrl}/orgSpRecord/getReportByOrgAndMonth`,
    method: 'get',
    params: {
      orgId: data.orgId,
      dateMonth: data.dateMonth
    }
  })
}


/**
 *
 * 判断子级退回按钮是否可以显示
 * @param data
 */
export function checkIsShowBackButton(data) {
  return request({
    url: `${baseUrl}/orgSpRecord/checkChildIsShowButton`,
    method: 'get',
    params: data
  })
}

