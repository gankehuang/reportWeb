import request from '@/utils/request'
import baseUrl from  './baseApiUrl'

/**
 * 新增
 * @param data
 * @param qualificationId
 * @param fillIds
 */
export function add (data,qualificationId,fillIds,type) {
  return request({
    url: `${baseUrl}/contractor/insert`,
    method: 'post',
    data,
    params:{
      qualificationIds:qualificationId,
      formAttachmentIds:fillIds,
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
 */
export function update (data,projectId,qualificationId,fillIds,type) {
  return request({
    url: `${baseUrl}/contractor/edit/${projectId}`,
    method: 'post',
    data,
    params:{
      qualificationIds:qualificationId,
      formAttachmentIds:fillIds,
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
    url: `${baseUrl}/contractor/getDetail/${data}`,
    method: 'get',
  })
}

/**
 * 删除
 * @param data
 */
export function deleteById (data) {
  return request({
    url: `${baseUrl}/contractor/delete/${data}`,
    method: 'get',
  })
}


/**
 * 查看银行明细
 * @param data
 */
export function getBankDetail (data) {
  return request({
    url: `${baseUrl}/contractor/getBankDetail/${data}`,
    method: 'get',
  })
}

/**
 * 删除银行
 * @param data
 */
export function deleteBybank (data) {
  return request({
    url: `${baseUrl}/contractor/deleteByBankId/${data}`,
    method: 'get',
  })
}


/**
 * 获取单位、评分、经营类型数据
 * @param data
 */
export function getScoreType (data) {
  return request({
    url: `${baseUrl}/contractor/scoreType/${data}`,
    method: 'get',
  })
}


/**
 * 流程审批
 * @param data
 */
export function auditProcess (data,qualificationIds,formAttachmentIds) {
  return request({
    url: `${baseUrl}/contractor/audit`,
    method: 'post',
    data,
    params:{
      qualificationIds:qualificationIds,
      formAttachmentIds:formAttachmentIds
    }
  })
}
