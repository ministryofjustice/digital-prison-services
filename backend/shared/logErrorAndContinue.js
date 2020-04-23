const log = require('../log')

module.exports = apiCall =>
  new Promise(resolve => {
    apiCall.then(response => resolve(response)).catch(error => {
      log.error(error)
      resolve(null)
    })
  })
