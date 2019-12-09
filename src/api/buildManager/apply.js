import request from '@/utils/request'
import baseUrl from  './baseApiUrl'

/**
 * 新增
 * @param data
 * @param qualificationId
 * @param fillIds
 */
export function add (data,idCarts,commissions,reviewForms,type,projectType) {
  return request({
    url: `${baseUrl}/contractorApply/insert`,
    method: 'post',
    data,
    params:{
      idCarts:idCarts,
      commissions:commissions,
      reviewForms:reviewForms,
      type:type,
      projectType:projectType
    }
  })
}

/**
 * 修改
 * @param data
 * @param projectId
 * @param qualificationId
 * @param fillIds
 */
export function update (data,projectId,idCarts,commissions,reviewForms,type,projectType) {
  return request({
    url: `${baseUrl}/contractorApply/edit/${projectId}`,
    method: 'post',
    data,
    params:{
      idCarts:idCarts,
      commissions:commissions,
      reviewForms:reviewForms,
      type:type,
      projectType:projectType
    }
  })
}

/**
 * 根据id查详情
 * @param data
 */
export function getById (data) {
  return request({
    url: `${baseUrl}/contractorApply/getDetail/${data}`,
    method: 'get',
  })
}

/**
 * 删除
 * @param data
 */
export function deleteById (data) {
  return request({
    url: `${baseUrl}/contractorApply/delete/${data}`,
    method: 'get',
  })
}


/**
 * 获取类型数据
 * @param data
 */
export function getScoreType (data) {
  return request({
    url: `${baseUrl}/contractorApply/scoreType/${data}`,
    method: 'get',
  })
}


/**
 * 获取类型数据
 * @param data
 */
export function selectAllByPass (data) {
  return request({
    url: `${baseUrl}/contractorApply/selectAllByPass`,
    method: 'get',
    params:{
      unitName:data
    }
  })
}


/**
 * 流程审批
 * @param data
 */
export function auditProcess (data,idCarts,commissions,reviewForms) {
  return request({
    url: `${baseUrl}/contractorApply/audit`,
    method: 'post',
    data,
    params:{
      idCarts:idCarts,
      commissions:commissions,
      reviewForms:reviewForms
    }
  })
}
