import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import router from '@/router'

// 创建axios实例
const service = axios.create({
    baseURL: process.env.BASE_API, // api 的 base_url
    timeout: 1000 * 60 * 30 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
    config => {
        if (store.getters.token) {
            config.headers['Authentication'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// response 拦截器
service.interceptors.response.use(
    response => {
        /**
         * code为非20000是抛错 可结合自己业务进行修改
         */
        const res = response.data
        if (res.status !== 200 && !(response.config.url.indexOf('/orgSpRecord/checkReportIsSp') > -1)) {
            let msg = ''
            if (res.message && res.message !== undefined && res.message.length > 0 && typeof res.message === 'object') {
                res.message.forEach((item, index) => {
                    if (index === 0) {
                        msg += item.message
                    } else {
                        msg += ';' + item.message
                    }
                })
            } else if (res.message && res.message !== undefined && typeof res.message === 'string') {
                msg = res.message
            }
            if ((res.status === 401 || res.status === 402) && msg !== '用户名或密码错误') {
            /*  MessageBox.alert(
                    '登录信息过期或长时间未操作，请重新登录',
                    '确定登录', {
                        confirmButtonText: '重新登录',
                        callback: action => {
                            store.dispatch('FedLogOut').then(() => {
                                if (process.env.NODE_ENV === 'production') { //生产環境跳到首頁
                                    location.href = process.env.PORTAL_API
                                } else {
                                    location.reload()
                                }
                            })
                        }
                    }
                )*/
              if (store.getters.number&&/login/g.test(window.location.hash)==false) {//如果用户名存在或者不是登录页面时
                MessageBox.prompt('输入密码重新登录', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  inputPattern: /^[\S]*$/,
                  inputErrorMessage: '密码不可输入空格',
                  inputType: 'password'
                }).then(value => {
                  let obj = {
                    userName: store.getters.number,
                    password: value.value
                  }
                  store.dispatch('Login', obj).then(() => store.dispatch('ReSetOrg'))
                    .then(() => {
                    // 如果是页面跳转途中token失效则刷新页面 如果是提交数据token失效则不做反应
                    if (response.config.method === "get") {
                      router.go(0);
                    } else {
                      return response.data
                    }
                  }).catch(() => {
                    store.dispatch('FedLogOut').then(() => {
                      router.go(0);
                    })
                  })
                }).catch(error => {
                  store.dispatch('FedLogOut').then(() => {
                    router.go(0);
                  })
                });
              }
            } else {
                Message({
                    message: msg,
                    type: 'error',
                    duration: 1 * 1000
                })
            }

            if (res.status === 403) {
                Message({
                    message: '权限不足!',
                    type: 'error',
                    duration: 1 * 1000
                })
            }
            return Promise.reject(msg)
        } else {
            return response.data
        }
    },
    error => {
        if (error.response.data.status !== undefined && error.response.data.status === 401) {
          /* MessageBox.alert(
                '登录信息过期，请重新登录',
                '确定登出', {
                    confirmButtonText: '重新登录',
                    callback: action => {
                        store.dispatch('FedLogOut').then(() => {
                            location.reload() // 为了重新实例化vue-router对象 避免bug
                        })
                    }
                }
            )*/
         if (store.getters.number && window.document.location.pathname !== '/') {
            MessageBox.prompt('输入密码重新登录', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPattern: /^[\S]*$/,
              inputErrorMessage: '密码不可输入空格',
              inputType: 'password'
            }).then(value => {
              let obj = {
                userName: store.getters.number,
                password: value.value
              }
              store.dispatch('Login', obj).then(() => {
                if (response.config.method === "get") {
                  router.go(0);
                } else {
                  return response.data
                }
              }).catch(() => {
                store.dispatch('FedLogOut').then(() => {
                  router.go(0);
                })
              })
            }).catch(error => {
              store.dispatch('FedLogOut').then(() => {
                router.go(0);
              })
            });
          }
        } else {
            Message({
                message: '系统问题，请联系管理员',
                type: 'error',
                duration: 2 * 1000
            })
        }
        return Promise.reject(error)
    }
)

export default service
