const log = require('../log')

module.exports = apiCall =>
  new Promise(resolve => {
    apiCall.then(response => resolve(response)).catch(error => {
      // Not Found 404 is an acceptable response.
      // It has been logged as part of the client call,
      // no need to repeat here.
      if (error.status !== 404) {
        log.error(error)
      }
      resolve(null)
    })
  })
