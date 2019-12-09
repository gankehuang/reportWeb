import request from '@/utils/request'

const PATH = "/BUSINESSREPORT"

/**
 * 获取列表
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
        url: PATH + '/custloanplansum/getAll',
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
        url: PATH + '/custloanplansum/getForNew',
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
        url: PATH + `/custloanplansum/getById/${params}`,
        method: 'get',
    })
}

/**
 * 新增
 * @param params
 */
export function add(params) {
    return request({
        url: PATH + `/custloanplansum/insert`,
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
        url: PATH + `/custloanplansum/delete`,
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
        url: PATH + `/custloanplansum/update`,
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
        url: PATH + `/custloanplansum/audit`,
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
        url: PATH + `/custloanplansum/unAudit`,
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