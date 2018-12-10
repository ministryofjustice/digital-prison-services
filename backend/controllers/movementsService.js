const moment = require('moment')

const movementsServiceFactory = elite2Api => {
  const getMovementsIn = (context, agencyId) => {
    const isoDateToday = moment().format('YYYY-MM-DD')
    return elite2Api.getMovementsIn(context, agencyId, isoDateToday)
  }

  return {
    getMovementsIn,
  }
}

module.exports = {
  movementsServiceFactory,
}
