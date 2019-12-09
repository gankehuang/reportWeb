import request from '@/utils/request'
import baseUrl from  '../buildManager/baseApiUrl'

/**
 * 新增
 * @param data
 * @param qualificationId
 * @param fillIds
 */
export function add (data,type) {
  return request({
    url: `${baseUrl}/device/insert`,
    method: 'post',
    data,
    params:{
      type:type
    }
  })
}

/**
 * 修改
 * @param data
 * @param projectId
 * @param qualificationId
 * @param fillIds
 * @param type
 */
export function update (data,projectId,type) {
  return request({
    url: `${baseUrl}/device/edit/${projectId}`,
    method: 'post',
    data,
    params:{
      type:type
    }
  })
}
/**
 * 根据id查详情
 * @param data
 */
export function getById (data) {
  return request({
    url: `${baseUrl}/device/getDetail/${data}`,
    method: 'get',
  })
}

/**
 * 删除
 * @param id
 */
export function deleteById (id) {
  return request({
    url: `${baseUrl}/device/delete/${id}`,
    method: 'get',
  })
}


/**
 * 删除材料管理明细
 * @param id
 */
export function deleteByBankId (id) {
  return request({
    url: `${baseUrl}/device/deleteByBankId/${id}`,
    method: 'get',
  })
}




/**
 * 流程审批
 * @param data
 */
export function auditProcess (data) {
  return request({
    url: `${baseUrl}/device/audit`,
    method: 'post',
    data
  })
}
