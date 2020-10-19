const moment = require('moment')

const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const { alertFlagLabels } = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ movementsService, logError }) => async (req, res) => {
  try {
    const agencyId = res.locals.user.activeCaseLoad.caseLoadId
    const enRouteResponse = await movementsService.getOffendersEnRoute(res.locals, agencyId)

    const results = enRouteResponse
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(offender => {
        const departed = `<div>${moment(offender.movementTime, 'HH:mm:ss').format('HH:mm')}</div>${moment(
          offender.movementDate,
          'YYYY-MM-DD'
        ).format('DD/MM/YYYY')}`
        const alerts = alertFlagLabels.filter(alertFlag =>
          alertFlag.alertCodes.some(alert => offender.alerts && offender.alerts.includes(alert))
        )
        return {
          name: putLastNameFirst(offender.firstName, offender.lastName),
          offenderNo: offender.offenderNo,
          dob: moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          departed,
          from: offender.fromAgencyDescription,
          reason: offender.movementReasonDescription,
          alerts,
          category: offender.category,
        }
      })

    return res.render('establishmentRoll/enRoute.njk', {
      results,
      agencyName: res.locals.user.activeCaseLoad.description,
      notmUrl: dpsUrl,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to load en route page')

    return res.render('error.njk', {
      url: '/establishment-roll/en-route',
      homeUrl: dpsUrl,
    })
  }
}
