const { switchDateFormat } = require('../../utils')

const getActivityLocationsFactory = ({ elite2Api, logError }) => {
  const getActivityLocations = async (req, res) => {
    try {
      const date = switchDateFormat(req.query.bookedOnDay)
      const response = await elite2Api.searchActivityLocations(res.locals, req.query.agencyId, date, req.query.timeSlot)

      return res.json(response)
    } catch (error) {
      if (error.code === 'ECONNRESET' || (error.stack && error.stack.toLowerCase().includes('timeout'))) {
        return res.json({
          error: true,
        })
      }

      logError(req.originalUrl, error, 'getActivityLocations()')
      const errorStatusCode = (error && error.status) || (error.response && error.response.status) || 500
      res.status(errorStatusCode)
      return res.end()
    }
  }

  return {
    getActivityLocations,
  }
}

module.exports = { getActivityLocationsFactory }
