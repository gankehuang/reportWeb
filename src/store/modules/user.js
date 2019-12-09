import { login, logout, getInfo,setOrgSession } from '@/api/login'
import {
  getToken,
  setToken,
  removeToken,
  setUser,
  getUser,
  getUserId,
  setOrgInfo,
  getOrgInfo,
  setPlanYearMonth,
  getPlanYearMonth
} from '@/utils/auth'

const qs = require('qs')
import Vue from 'vue'

const user = {
  state: {
    token: getToken(),
    name: getUser().name,
    loginTime: getUser().loginTime,
    avatar: '',
    roles: [],
    userId: getUserId(),
    number: getUser().number,
    orgInfo: getOrgInfo(),
    planYearMonth: getPlanYearMonth()
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_LGINTIME: (state, time) => {
      state.loginTime = time
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_USERID: (state, userId) => {
      state.userId = userId
    },
    SET_ORG_INFO: (state, orgInfo) => {
      Vue.set(state, 'orgInfo', orgInfo)
      setOrgInfo(orgInfo)
    },
    SET_PLANYEARMONTH_INFO: (state, planYearMonth) => {
      Vue.set(state, 'planYearMonth', planYearMonth)
      setPlanYearMonth(planYearMonth)
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(qs.stringify(userInfo)).then(response => {
          const data = response.data
          setToken(data.Authentication)
          response.data.user.loginTime = response.date
          setUser(response.data)
          commit('SET_USERID', response.data.user.id)
          commit('SET_LGINTIME', response.date)
          commit('SET_TOKEN', data.Authentication)
          commit('SET_NAME', data.user.name)
          commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        let token = getToken()

        getInfo(token).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const roles = response.data
          if (roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', roles)
          } else {
            reject('该用户无权限!')
          }

          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_ORG_INFO', null)
          commit('SET_PLANYEARMONTH_INFO', null)
          removeToken()
          resolve()
        }).catch(error => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PLANYEARMONTH_INFO', null)
          commit('SET_ORG_INFO', null)
          removeToken()
          resolve()
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PLANYEARMONTH_INFO', null)
        commit('SET_ORG_INFO', null)
        removeToken()
        resolve()
      })
    },
    ReSetOrg ({ commit }) {
      return new Promise((resolve, reject) => {
        if (getOrgInfo()) {
          setOrgSession(getOrgInfo()).then(() => {
            resolve()
          })
        } else {
          reject()
        }

      })
    }
  }
}

export default user
