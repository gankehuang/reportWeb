import request from '@/utils/request'

const PATH = "/BUSINESSREPORT"

/**
 * 获取列表
 * @param params
 */
export function getList(params) {
    return request({
        url: PATH + '/PigBalanceController/getPigBalanceDataByParam',
        method: 'post',
        data: params
    })
}

/**
 * 获取组织树
 * @param params
 */
export function getTree(params) {
    return request({
        url: PATH + '/roma/getMyOrg',
        method: 'get',
        params: params
    })
}