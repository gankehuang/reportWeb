import request from '@/utils/request'
const PATH = 'BUSINESSREPORT'
const PathAuth = 'BUSINESSREPORT'

/**
 * 代建和租赁栏舍计划及反馈接口导入
 * @param data
 */
export function importLeasePlanReport(params) {
  return request(
    {
      url: `${PATH}/leaseHouseFeedback/excelUpload`,
      method: 'post',
      data: params,
    }
  )
}
/**
 * 人员招聘计划及反馈接口导入
 * @param data
 */
export function importReport(params) {
  return request(
    {
      url: `${PATH}/recruitmentFeedback/excelUpload`,
      method: 'post',
      data: params,
    }
  )
}
/**
 * 获取人事管理反馈列表
 * @param data
 */
export function getPersonneList(data) {
  return request({
    url: `${PATH}/personneManagement/getAll`,
    method: 'get',
    params:data
  })
}


/**
 * 保存人事管理反馈
 * @param data
 */
export function updatePersonneList(data) {
  return request({
    url: `${PATH}/personneManagement/update`,
    method: 'post',
    data: data
  })
}

/**
 * 删除人事管理反馈主表
 * @param data
 */
export function deletePersonneList(data) {
  return request({
    url: `${PATH}/personneManagement/delete`,
    method: 'post',
    data: data
  })
}
/**
 * 人事反馈导入
 * @param data
 */
export function personalImportReport(params) {
  return request(
    {
      url: `${PATH}/personneManagement/excelUpload`,
      method: 'post',
      data: params,
    }
  )
}
/**
 * 获取代建和租赁栏舍计划及反馈列表
 * @param data
 */
export function getLeaseList(data) {
  return request({
    url: `${PATH}/leaseHouseFeedback/getAll`,
    method: 'get',
    params: data
  })
}

/**
 * 修改代建和租赁栏舍计划及反馈
 * @param data
 */
export function updateLeaseList(data) {
  return request({
    url: `${PATH}/leaseHouseFeedback/update`,
    method: 'post',
    data: data
  })
}

/**
 * 删除代建和租赁栏舍计划及反馈
 * @param data
 */
export function deleteLeaseList(data) {
  return request({
    url: `${PATH}/leaseHouseFeedback/delete`,
    method: 'post',
    data: data
  })
}

/**
 * 修改人员招聘计划及反馈
 * @param data
 */
export function updateFeedbackList(data) {
  return request({
    url: `${PATH}/recruitmentFeedback/update`,
    method: 'post',
    data: data
  })
}

/**
 *
 获取人员招聘计划及反馈列表
 * @param data
 */
export function getFeedbackList(data) {
  return request({
    url: `${PATH}/recruitmentFeedback/getAll`,
    method: 'get',
    params: data
  })
}

/**
 *
 获取人员招聘计划及反馈列表
 * @param data
 */
export function deletebackListList(data) {
  return request({
    url: `${PATH}/recruitmentFeedback/delete`,
    method: 'post',
    data: data
  })
}

/**
 *
 人事管理反馈审批
 * @param data
 */
export function auditPersonneList(data) {
  return request({
    url: `${PATH}/personneManagement/audit`,
    method: 'post',
    data: data
  })
}

/**
 *
 人事管理反馈反审批
 * @param data
 */
export function unAuditPersonneList(data) {
  return request({
    url: `${PATH}/personneManagement/unAudit`,
    method: 'post',
    data: data
  })
}

/**
 * 代建和租赁栏舍计划及反馈审核
 * @param data
 */
export function auditLeaseList(data) {
  return request({
    url: `${PATH}/leaseHouseFeedback/audit`,
    method: 'post',
    data: data
  })
}

/**
 * 代建和租赁栏舍计划及反馈反审核
 * @param data
 */
export function unAuditLeaseList(data) {
  return request({
    url: `${PATH}/leaseHouseFeedback/unAudit`,
    method: 'post',
    data: data
  })
}

/**
 * 人员招聘计划及反馈审核
 * @param data
 */
export function auditbackListList(data) {
  return request({
    url: `${PATH}/recruitmentFeedback/audit`,
    method: 'post',
    data: data
  })
}

/**
 * 人员招聘计划及反馈反审核
 * @param data
 */
export function unAuditbackListList(data) {
  return request({
    url: `${PATH}/recruitmentFeedback/unAudit`,
    method: 'post',
    data: data
  })
}

/**
 * 反审核是否确认
 * @param data
 */
export function isCheckReport(data) {
  return request({
    url: `${PathAuth}/orgSpRecord/checkReportIsSp`,
    method: 'get',
    params: data
  })
}

/**
 * 代建和租赁栏舍计划及反馈 --反馈
 * @param data
 */
export function feedbackLeaseList(data) {
  return request({
    url: `${PATH}/leaseHouseFeedback/feedback`,
    method: 'post',
    data: data
  })
}

/**
 * 人事管理反馈 --反馈
 * @param data
 */
export function feedbackPersonneList(data) {
  return request({
    url: `${PATH}/personneManagement/feedback`,
    method: 'post',
    data: data
  })
}

/**
 * 人员招聘计划及反馈 --反馈
 * @param data
 */
export function feedbackRecruitmentList(data) {
  return request({
    url: `${PATH}/recruitmentFeedback/feedback`,
    method: 'post',
    data: data
  })
}
