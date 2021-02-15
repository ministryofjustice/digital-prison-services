const moment = require('moment')

const { getCurrentPeriod } = require('../utils')

module.exports = whereaboutsApi => {
  const renderTemplate = async (req, res, pageData) => {
    const today = moment()
    const { errors, formValues } = pageData || {}
    try {
      const {
        user: { activeCaseLoad },
      } = res.locals
      const residentialLocations = await whereaboutsApi.searchGroups(res.locals, activeCaseLoad.caseLoadId)

      return res.render('selectResidentialLocation.njk', {
        date: formValues?.date || today.format('DD/MM/YYYY'),
        errors,
        period: formValues?.period || getCurrentPeriod(today),
        residentialLocations: residentialLocations.map(location => ({ text: location.name, value: location.key })),
      })
    } catch (error) {
      res.locals.redirectUrl = '/manage-prisoner-whereabouts'
      throw error
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = (req, res) => {
    const { currentLocation, date, period } = req.body

    if (!currentLocation) {
      return renderTemplate(req, res, {
        errors: [{ text: 'Select a location', href: '#currentLocation' }],
        formValues: req.body,
      })
    }

    return res.redirect(
      `/manage-prisoner-whereabouts/housing-block-results?currentLocation=${currentLocation}&date=${date}&period=${period}`
    )
  }

  return { index, post }
}
