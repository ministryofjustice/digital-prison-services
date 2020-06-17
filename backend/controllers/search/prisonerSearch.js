const { serviceUnavailableMessage } = require('../../common-messages')
const alertFlagValues = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ paginationService, elite2Api, logError }) => async (req, res) => {
  try {
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const { location, keywords, alerts, pageOffsetOption, pageLimit = 50 } = req.query

    const pageOffset = parseInt(pageOffsetOption, 10) || 0

    const hasSearched = Boolean(Object.keys(req.query).length)

    const context = {
      ...res.locals,
      requestHeaders: { 'page-offset': pageOffset, 'page-limit': pageLimit },
    }

    const [locations, prisoners] = await Promise.all([
      elite2Api.userLocations(res.locals),
      elite2Api.getInmates(context, location, {
        keywords,
        alerts,
        returnIep: 'true',
        returnAlerts: 'true',
        returnCategory: 'true',
      }),
    ])

    const totalPrisoners = context.responseHeaders['total-records']

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
      errors: [],
      formValues: req.query,
      hasSearched,
      locationOptions,
      pagination: paginationService.getPagination(totalPrisoners, pageOffset, pageLimit, fullUrl),
      results,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/', homeUrl: '/' })
  }
}

// ;[
//   {
//     bookingId: 1102484,
//     bookingNo: 'W21339',
//     offenderNo: 'G6123VU',
//     firstName: 'JOHN',
//     lastName: 'SAUNDERS',
//     dateOfBirth: '1990-10-12',
//     age: 29,
//     agencyId: 'MDI',
//     assignedLivingUnitId: 27136,
//     assignedLivingUnitDesc: 'MCASU-CASU1-C1-010',
//     facialImageId: 1412890,
//     iepLevel: 'Standard',
//     categoryCode: 'C',
//     imprisonmentStatus: 'LR_HDC',
//     alertsCodes: [],
//     alertsDetails: [
//       'XA',
//       'XVL',
//       'RSS',
//       'XC',
//       'XCU',
//       'XSA',
//       'XHT',
//       'XGANG',
//       'XTACT',
//       'LFC21',
//       'XSC',
//       'XOCGN',
//       'F1',
//       'PC1',
//       'HPI',
//       'HA',
//       'RCDR',
//       'URS',
//       'URCU',
//       'USU',
//       'UPIU',
//     ],
//     convictedStatus: 'Convicted',
//   },
// ]
