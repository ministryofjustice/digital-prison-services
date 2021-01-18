const moment = require('moment')

const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const { alertFlagLabels } = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ movementsService }) => async (req, res) => {
  const agencyId = res.locals.user.activeCaseLoad.caseLoadId
  const response = await movementsService.getMovementsOut(res.locals, agencyId)

  const results = response
    ?.sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
    ?.map(offender => {
      const alerts = alertFlagLabels.filter(alertFlag =>
        alertFlag.alertCodes.some(alert => offender.alerts && offender.alerts.includes(alert))
      )
      return {
        name: putLastNameFirst(offender.firstName, offender.lastName),
        offenderNo: offender.offenderNo,
        dob: moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        reason: offender.reasonDescription,
        timeOut: moment(offender.timeOut, 'HH:mm:ss').format('HH:mm'),
        alerts,
        category: offender.category,
      }
    })

  return res.render('establishmentRoll/outToday.njk', {
    results,
    notmUrl: dpsUrl,
  })
}
