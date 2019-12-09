import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/AUTH/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/AUTH/menu/getCurrentUserMenus',
    method: 'post',
    params: {
      token: token,
      serverFlag: 'BUSINESSREPORT'
    }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function setOrgSession (params) {
  return request({
    url: '/BUSINESSREPORT/common/chooseOrg',
    method: 'post',
    params: params
  })
}
