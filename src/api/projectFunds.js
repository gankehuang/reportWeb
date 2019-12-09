import request from '@/utils/request'

const PATH = "BUSINESSREPORT"

export function add(params) {
    return request({
        url: PATH + `/projectFundingFeedback/inset`,
        method: 'post',
        data: params
    })
}

export function getAll(params) {
    return request({
        url: PATH + `/projectFundingFeedback/getAll`,
        method: 'get',
        params: params
    })
}

export function update(params) {
    return request(
        {
            url: PATH + `/projectFundingFeedback/update`,
            method: 'post',
            data: params
        }
    )
}


export function deleteById(params) {
    return request(
        {
            url: PATH + `/projectFundingFeedback/delete`,
            method: 'post',
            data: params
        }
    )
}

export function getTree(params) {
    return request({
        url: PATH + '/roma/getMyOrg',
        method: 'get'
    })
}

export function audit(params) {
    return request({
        url: PATH + '/projectFundingFeedback/audit',
        method: 'post',
        data: params
    })
}

export function unAudit(params) {
    return request({
        url: PATH + '/projectFundingFeedback/unAudit',
        method: 'post',
        data: params
    })
}

export function checkReportIsSp(data) {
    return request({
        url: PATH + '/orgSpRecord/checkReportIsSp',
        method: 'get',
        params: data
    })
}
export function feedback(params) {
    return request(
        {
            url: PATH + `/projectFundingFeedback/feedback`,
            method: 'post',
            data: params
        }
    )
}

