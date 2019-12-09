import request from '@/utils/request'

const PATH = "/BUSINESSREPORT"

/**
 * 获取组织
 * @param params
 */
export function getOrgList(params) {
    return request({
        url: PATH +`/roma/getMyOrg`,
        method: 'get',
        params: params
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

/**
 * 获取子节点
 * @param params
 */
export function getSubOrg(params) {
    return request({
        url: PATH +`/roma/getSubOrg`,
        method: 'get',
        params: params
    })
}

/**
 * 获取品种
 * @param params
 */
export function getVariety(params) {
    return request({
        url: PATH + '/reserved/selectPigVarietiles',
        method: 'post',
        data: params
    })
}

/**
 * 判断是否可以进行反审批
 * @param params
 */
export function checkReportIsSp(params) {
    return request({
        url: PATH + `/orgSpRecord/checkReportIsSp`,
        method: 'get',
        params: params
    })
}

/**
 * 判断是否可以进行保存
 * @param params
 */
export function checkReportIsSave(params) {
    return request({
        url: PATH + `/orgSpRecord/checkReportIsSave`,
        method: 'get',
        params: params
    })
}

/**
 * 获取引种计划数量
 * @param params
 */
export function getIntroduction(params) {
    return request({
        url: PATH + `/exoticPlanEntry/getYZSum`,
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
        url: PATH + '/reserved/getAll',
        method: 'get',
        params: params
    })
}

/**
 * 获取详情
 * @param params
 */
export function getDetail(params) {
    return request({
        url: PATH + `/reserved/getById/${data}`,
        method: 'get',
    })
}

/**
 * 新增
 * @param params
 */
export function addSWine(params) {
    return request({
        url: PATH + `/reserved/insert`,
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
        url: PATH + `/reserved/delete`,
        method: 'post',
        data
    })
}