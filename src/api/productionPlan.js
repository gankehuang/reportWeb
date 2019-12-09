import request from '@/utils/request'

const PATH = "/BUSINESSREPORT"

/**
 * 获取组织
 * @param params
 */
export function getOrgList(params) {
    return request({
        url: PATH + '/roma/getMyOrg',
        method: 'get',
        params: params
    })
}

/**
 * 判断是否可以修改
 * @param params
 */
export function checkFCSave(params) {
    return request({
        url: PATH + `/plan/checkSave`,
        method: 'post',
        params: params
    })
}

/**
 * 获取出苗
 * @param params
 */
export function getCMPig(params) {
    return request({
        url: PATH + `/sproutPlanEntry/selectWXPig`,
        method: 'get',
        params: params
    })
}

/**
 * 获取生产指标
 * @param params
 */
export function getSCIndex(params) {
    return request({
        url: PATH + '/roma/getSCIndex',
        method: 'get',
        params: params
    })
}

/**
 * 获取列表
 * @param params
 */
export function getList(params) {
    return request({
        url: PATH + '/plan/getAll',
        method: 'get',
        params: params
    })
}

/**
 * 获取详情
 * @param params
 */
export function getDetail(data) {
    return request({
        url: PATH + `/plan/getById/${data}`,
        method: 'get',
    })
}

/**
 * 新增
 * @param params
 */
export function addSWine(params) {
    return request({
        url: PATH + `/plan/insert`,
        method: 'post',
        data: params
    })
}

/**
 * 删除
 * @param data
 */
export function deleteById(data) {
    return request({
        url: PATH + `/plan/delete`,
        method: 'post',
        data
    })
}
