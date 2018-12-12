const moment = require('moment')
const oauthClientId = require('../api/oauthClientId')

const movementsServiceFactory = elite2Api => {
  const getMovementsIn = (context, agencyId) => {
    const isoDateToday = moment().format('YYYY-MM-DD')
    return elite2Api.getMovementsIn(context, agencyId, isoDateToday)
    // TODO getting flags etc:
    // const systemContext = await oauthClientId.getClientCredentialsTokens()
    // const stuff = await elite2Api.getAlertsSystem(systemContext, offenderNos)
  }

  return {
    getMovementsIn,
  }
}

module.exports = {
  movementsServiceFactory,
}
