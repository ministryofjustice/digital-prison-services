const moment = require('moment')

const { switchDateFormat, getCurrentPeriod } = require('../utils')

module.exports = ({ prisonApi }) => {
  const index = async (req, res) => {
    try {
      const {
        user: { activeCaseLoad },
      } = res.locals

      const bookedOnDay = req.query?.date || moment().format('DD/MM/YYYY')

      const date = switchDateFormat(bookedOnDay)
      const period = req.query?.period || getCurrentPeriod(date)

      const activityLocations = await prisonApi.searchActivityLocations(
        res.locals,
        activeCaseLoad.caseLoadId,
        date,
        period
      )

      const locationDropdownValues = activityLocations?.map(location => ({
        text: location.userDescription,
        value: location.locationId,
      }))

      return res.render('selectActivityLocation.njk', {
        period,
        date: bookedOnDay,
        locationDropdownValues,
        errors: req.flash('errors'),
      })
    } catch (error) {
      res.locals.redirectUrl = `/manage-prisoner-whereabouts`
      throw error
    }
  }

  const post = async (req, res) => {
    const { currentLocation, date, period } = req.body

    if (!currentLocation) {
      req.flash('errors', { text: 'Select the location', href: '#current-location' })
      return res.redirect(`/manage-prisoner-whereabouts/select-activity-location?date=${date}&period=${period}`)
    }

    const bookedOnDay = date || moment().format('DD/MM/YYYY')

    return res.redirect(
      `/manage-prisoner-whereabouts/activity-results?location=${currentLocation}&date=${bookedOnDay}&period=${period}`
    )
  }

  return {
    index,
    post,
  }
}
