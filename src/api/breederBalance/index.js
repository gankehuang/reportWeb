import request from '@/utils/request'

const PATH = "BUSINESSREPORT"

export function getPigs(params) {
    return request({
        url: PATH + `/BreedPigBalanceController/getBreedDataByParam`,
        method: 'post',
        data: params
    })
}

export function getTree(params) {
  return request({
      url: PATH + '/roma/getMyOrg',
      method: 'get'
  })
}