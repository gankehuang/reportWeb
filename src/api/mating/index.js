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
 * 获取列表
 * @param params
 */
export function getList(params) {
    return request({
        url: PATH + '/breedPlanTotal/getAll',
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
        url: PATH + '/breedPlanTotal/getTotalByOrgAndPeriod',
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
        url: PATH + `/breedPlanTotal/getById/${params}`,
        method: 'get',
    })
}

/**
 * 新增
 * @param params
 */
export function add(params) {
    return request({
        url: PATH + `/breedPlanTotal/save`,
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
        url: PATH + `/breedPlanTotal/delete`,
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
        url: PATH + `/breedPlanTotal/update`,
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
        url: PATH + `/breedPlanTotal/audit`,
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
        url: PATH + `/breedPlanTotal/approve`,
        method: 'post',
        params: params
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