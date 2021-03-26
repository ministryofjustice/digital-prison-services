const page = require('../page')

const alertAreadyClosedPage = () =>
  page('This alert has already been closed', {})

export default {
  verifyOnPage: alertAreadyClosedPage,
}
