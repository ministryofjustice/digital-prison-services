const moment = require('moment')

const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const { alertFlagLabels } = require('../../shared/alertFlagValues')
const { putLastNameFirst, stripAgencyPrefix } = require('../../utils')

module.exports = ({ movementsService, logError }) => async (req, res) => {
  try {
    const agencyId = res.locals.user.activeCaseLoad.caseLoadId
    const response = await movementsService.getOffendersCurrentlyOutOfAgency(res.locals, agencyId)

    const results = response
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(offender => {
        const alerts = alertFlagLabels.filter(alertFlag =>
          alertFlag.alertCodes.some(alert => offender.alerts && offender.alerts.includes(alert))
        )
        return {
          name: putLastNameFirst(offender.firstName, offender.lastName),
          offenderNo: offender.offenderNo,
          dob: moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          location: stripAgencyPrefix(offender.location, offender.fromAgency),
          incentiveLevel: offender.iepLevel,
          currentLocation: offender.toCity,
          comment: offender.commentText,
          alerts,
          category: offender.category,
        }
      })

    return res.render('establishmentRoll/totalCurrentlyOut.njk', {
      results,
      livingUnitName: response.location,
      notmUrl: dpsUrl,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to load total currently out page')

    res.status(500)

    return res.render('error.njk', {
      url: '/establishment-roll/total-currently-out',
      homeUrl: dpsUrl,
    })
  }
}
