import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setUser(userInfo) {
  Cookies.set('userName', userInfo.user.number)
  Cookies.set('name', userInfo.user.name)
  Cookies.set('head', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
  Cookies.set('userId', userInfo.user.id)
  Cookies.set('loginTime', userInfo.user.loginTime)
  Cookies.set('number', userInfo.user.number)
}

export function getUserId() {
  return Cookies.get('userId')
}

export function getUser(type) {
  const userInfo = {}
  userInfo.userName = Cookies.get('userName')
  userInfo.name = Cookies.get('name')
  userInfo.head = Cookies.get('head')
  userInfo.userId = Cookies.get('userId')
  userInfo.loginTime = Cookies.get('loginTime')
  userInfo.number = Cookies.get('number')
  return userInfo
}

export function setCustType(type) {
  return Cookies.set('custType', type)
}

export function getCustType() {
  return Cookies.get('custType') || '0'
}

export function setOrgInfo(orgInfo) {
  if (orgInfo) {
    Cookies.set('orgId', orgInfo.id)
    Cookies.set('orgName', orgInfo.name)
    Cookies.set('orgLongNum', orgInfo.longNumber)
    Cookies.set('orgLevel', orgInfo.type)
    Cookies.set('orgType', orgInfo.type)
    Cookies.set('orgParentId', orgInfo.parentId)
  } else {
    Cookies.set('orgId', '')
    Cookies.set('orgName', '')
    Cookies.set('orgLongNum', '')
    Cookies.set('orgLevel', '')
    Cookies.set('orgType', '')
    Cookies.set('orgParentId', '')
  }
}

export function getOrgInfo() {
  if (Cookies.get('orgId')) {
    const obj = {
      id: Cookies.get('orgId'),
      name: Cookies.get('orgName'),
      longNumber: Cookies.get('orgLongNum'),
      type: Cookies.get('orgType'),
      parentId: Cookies.get('orgParentId')
    }
    return obj
  } else {
    return null
  }
}

export function setPlanYearMonth(planYearMonth) {
  return Cookies.set('planYearMonth', planYearMonth)
}

export function getPlanYearMonth() {
  return Cookies.get('planYearMonth') || ''
}
