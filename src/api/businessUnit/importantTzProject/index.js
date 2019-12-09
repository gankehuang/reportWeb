import request from '@/utils/request'
import baseUrl from  '@/api/buildManager/baseApiUrl'

/**
 * 导入
 * @param data
 */
export function importReport(params) {
  return request(
    {
      url: `${baseUrl}/projectAnalysisEntry/importExcelByList`,
      method: 'post',
      data: params,
    }
  )
}

/**
 * 审批重要投资项目完成情况
 * @param data
 */
const approve=function(data) {
  return request({
    url: `${baseUrl}/projectAnalysis/approve`,
    params: {
         id: data.id,
         status: data.status,//
    },
    method: 'get'
  })
}

/**
 * 查询重要投资项目完成情况
 * @param data
 */
const find=function(data) {
  return request({
    url: `${baseUrl}/projectAnalysis/find`,
    params: {
         orgId: data.orgId,
         period: data.period,
    },
    method: 'get'
  })
}




/**
 * 新增/修改重要投资项目完成情况主表
 * @param data
 * @param qualificationId
 * @param fillIds
 */
const add = function(data) {
  return request({
    url: `${baseUrl}/projectAnalysis/insertOrUpdate`,
    method: 'post',
    data
  })
}



/**
 *
 * 删除重要投资项目完成情况主表
 * @param data
 */
const deleteInfo =   function(id) {
  return request({
    url: `${baseUrl}/projectAnalysis/delete/${id}`,
    params: {},
    method: 'get'
  })
}

export default{
	add,
	find,
	deleteInfo,
	approve,
  importReport
}
