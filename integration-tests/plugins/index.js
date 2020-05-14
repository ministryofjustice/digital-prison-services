const auth = require('../mockApis/auth')
const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: () => Promise.all([resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({})]),
  })
}
