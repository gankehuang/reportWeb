import request from '@/utils/request'
import baseUrl from  '@/api/buildManager/baseApiUrl'
/**
 * 导入
 * @param data
 */
export function importReport(params) {
  return request(
    {
      url: `${baseUrl}/taskTrackEntry/importExcelByList`,
      method: 'post',
      data: params,
    }
  )
}
/**
 * 审批任务清单追踪表完成情况列表
 * @param data
 */
const approve=function(data) {
  return request({
    url: `${baseUrl}/taskTrack/approve`,
    params: {
         id: data.id,
         status: data.status,//
    },
    method: 'get'
  })
}
/**
 * 查询任务清单追踪表完成情况
 * @param data
 */
const find=function(data) {
  return request({
    url: `${baseUrl}/taskTrack/find`,
    params: {
         orgId: data.orgId,
         period: data.period,
    },
    method: 'get'
  })
}




/**
 * 新增/修改重要管理提升项目主表
 * @param data
 */
const add = function(data) {
  return request({
    url: `${baseUrl}/taskTrack/insertOrUpdate`,
    method: 'post',
    data
  })
}



/**
 *
 * 删除任务清单追踪表主表
 * @param data
 */
const deleteInfo =   function(id) {
  return request({
    url: `${baseUrl}/taskTrack/delete/${id}`,
    params: {},
    method: 'get'
  })
}

export default{
	approve,
	add,
	find,
	deleteInfo,
  importReport
}
