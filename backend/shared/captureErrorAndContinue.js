const log = require('../log')

module.exports = apiCall =>
  new Promise(resolve => {
    apiCall.then(response => resolve({ response })).catch(error => {
      if (error.status !== 404) {
        log.error(error)
      }
      resolve({ error: true })
    })
  })
