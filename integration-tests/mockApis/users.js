const { stubFor, getFor } = require('./wiremock')

const stubHealth = (status = 200) =>
    stubFor({
        request: {
            method: 'GET',
            urlPath: '/health/ping',
        },
        response: {
            status,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            fixedDelayMilliseconds: status === 500 ? 5000 : '',
        },
    })

const stubUser = (username, caseload) => {
    const user = username || 'ITAG_USER'
    const activeCaseLoadId = caseload || 'MDI'
    return stubFor({
        request: {
            method: 'GET',
            url: `/auth/api/user/${encodeURI(user)}`,
        },
        response: {
            status: 200,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody: {
                user_name: user,
                staffId: 231232,
                username: user,
                active: true,
                name: `${user} name`,
                authSource: 'nomis',
                activeCaseLoadId,
            },
        },
    })
}

const stubUserMe = (username = 'ITAG_USER', staffId = 12345, name = 'James Stuart', caseload = 'MDI') =>
    getFor({
        urlPath: '/auth/api/user/me',
        body: {
            firstName: 'JAMES',
            lastName: 'STUART',
            name,
            username,
            activeCaseLoadId: caseload,
            staffId,
        },
    })

const stubEmail = (username) =>
    stubFor({
        request: {
            method: 'GET',
            url: `/auth/api/user/${encodeURI(username)}/email`,
        },
        response: {
            status: 200,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody: {
                username,
                email: `${username}@gov.uk`,
            },
        },
    })

module.exports = {
    stubHealth,
    stubUserMe,
    stubUser,
    stubEmail,
}
