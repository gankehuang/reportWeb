import request from '@/utils/request'

const PATH = "/BUSINESSREPORT"

/**
 * 获取组织列表
 * @param params
 */
export function getTree(params) {
    return request({
        url: PATH + '/roma/getMyOrg',
        method: 'get'
    })
}

/**
 * 获取所有组织
 * @param params
 */
export function getSubOrg(params) {
    return request({
        url: PATH + '/roma/getSubOrg',
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
        url: PATH + '/plamonoutplansum/getAll',
        method: 'get',
        params: params
    })
}
/**
 * 获取XX组织下级养户贷计划汇总信息列表
 * @param params
 */
export function getForNew(params) {
    return request({
        url: PATH + '/plamonoutplansum/getForNew',
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
        url: PATH + `/plamonoutplansum/getById/${params}`,
        method: 'get',
    })
}

/**
 * 新增
 * @param params
 */
export function add(params) {
    return request({
        url: PATH + `/plamonoutplansum/insert`,
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
        url: PATH + `/plamonoutplansum/delete`,
        method: 'post',
        data
    })
}
/**
 * 修改
 * @param params
 */
export function update(params) {
    return request({
        url: PATH + `/plamonoutplansum/update`,
        method: 'post',
        data: params
    })
}
/**
 * 审批
 * @param params
 */
export function audit(params) {
    return request({
        url: PATH + `/plamonoutplansum/audit`,
        method: 'post',
        data: params
    })
}
/**
 * 反审批
 * @param params
 */
export function unAudit(params) {
    return request({
        url: PATH + `/plamonoutplansum/unAudit`,
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