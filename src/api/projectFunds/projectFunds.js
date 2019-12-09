import request from '@/utils/request'

const PATH = "BUSINESSREPORT"

export function getAll(params) {
  return request({
    url: PATH + `/projectFundingFeedback/getAll`,
    method: 'get',
    params: params
  })
}

export function update(params) {
  return request(
    {
      url: PATH + `/projectFundingFeedback/update`,
      method: 'post',
      data: params
    }
  )
}

export function audit(params) {
  return request({
    url: PATH + '/projectFundingFeedback/audit',
    method: 'post',
    data: params
  })
}

export function unAudit(params) {
  return request({
    url: PATH + '/projectFundingFeedback/unAudit',
    method: 'post',
    data: params
  })
}

export function feedback(params) {
  return request(
    {
      url: PATH + `/projectFundingFeedback/feedback`,
      method: 'post',
      data: params
    }
  )
}

export function importReport(params) {
  return request(
    {
      url: PATH + `/projectFundingFeedback/excelUpload`,
      method: 'post',
      data: params,
    }
  )
}

