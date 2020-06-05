const page = require('../page')

const searchPage = () => page('Manage prisoner whereabouts', {})

export default {
  verifyOnPage: searchPage,
}
