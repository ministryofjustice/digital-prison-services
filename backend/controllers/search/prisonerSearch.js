const { serviceUnavailableMessage } = require('../../common-messages')
const alertFlagValues = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ paginationService, elite2Api, logError }) => async (req, res) => {
  const {
    user: { activeCaseLoad },
  } = res.locals
  const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
  const { location, keywords, alerts, pageOffsetOption } = req.query

  const pageOffset = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0
  const pageLimit = 50

  const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

  try {
    const context = { ...res.locals, requestHeaders: { 'page-offset': pageOffset, 'page-limit': pageLimit } }

    const [locations, prisoners] = await Promise.all([
      elite2Api.userLocations(res.locals),
      elite2Api.getInmates(context, location || currentUserCaseLoad, {
        keywords,
        alerts,
        returnIep: 'true',
        returnAlerts: 'true',
        returnCategory: 'true',
      }),
    ])

    const locationOptions = locations && locations.map(loc => ({ value: loc.locationPrefix, text: loc.description }))

    const results =
      prisoners &&
      prisoners.map(prisoner => ({
        ...prisoner,
        name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
        alerts: alertFlagValues.filter(alertFlag =>
          alertFlag.alertCodes.some(alert => prisoner.alertsDetails && prisoner.alertsDetails.includes(alert))
        ),
      }))

    return res.render('prisonerSearch/prisonerSearch.njk', {
      alertOptions: alertFlagValues.map(alertFlag => ({
        value: alertFlag.alertCodes,
        text: alertFlag.label,
        checked: alertFlag.alertCodes.some(alert => alerts && alerts.includes(alert)),
      })),
      formValues: req.query,
      locationOptions,
      pagination: paginationService.getPagination(
        context.responseHeaders['total-records'],
        pageOffset,
        pageLimit,
        fullUrl
      ),
      results,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/', homeUrl: '/' })
  }
}
