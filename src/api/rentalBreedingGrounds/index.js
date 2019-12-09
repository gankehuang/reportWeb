import request from '@/utils/request'

const PATH = "BUSINESSREPORT"

export function getAll(params) {
  return request({
    url: PATH + `/leaseFarmFeedback/getAll`,
    method: 'get',
    params: params
  })
}

export function update(params) {
  return request(
    {
      url: PATH + `/leaseFarmFeedback/update`,
      method: 'post',
      data: params
    }
  )
}

export function audit(params) {
  return request({
    url: PATH + '/leaseFarmFeedback/audit',
    method: 'post',
    data: params
  })
}

export function unAudit(params) {
  return request({
    url: PATH + '/leaseFarmFeedback/unAudit',
    method: 'post',
    data: params
  })
}

export function feedback(params) {
  return request(
    {
      url: PATH + `/leaseFarmFeedback/feedback`,
      method: 'post',
      data: params
    }
  )
}

export function importReport(params) {
  return request(
    {
      url: PATH  + `/leaseFarmFeedback/excelUpload`,
      method: 'post',
      data: params,
    }
  )
}
