const { switchDateFormat } = require('../../utils')

const getActivityLocationsFactory = ({ elite2Api, logError }) => {
  const getActivityLocations = async (req, res) => {
    try {
      const date = switchDateFormat(req.query.bookedOnDay)
      const response = await elite2Api.searchActivityLocations(res.locals, req.query.agencyId, date, req.query.timeSlot)
      res.json(response)
    } catch (error) {
      if (error.code === 'ECONNRESET') return
      logError(req.originalUrl, error, 'getActivityLocations()')
    }
  }

  return {
    getActivityLocations,
  }
}

module.exports = { getActivityLocationsFactory }
