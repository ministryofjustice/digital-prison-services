// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alertFlagL... Remove this comment to see the full error message
const { alertFlagLabels } = require('../../shared/alertFlagValues')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst, stripAgencyPrefix } = require('../../utils')

module.exports =
  ({ movementsService }) =>
  async (req, res) => {
    const agencyId = res.locals.user.activeCaseLoad.caseLoadId
    const response = await movementsService.getOffendersCurrentlyOutOfAgency(res.locals, agencyId)

    const results = response
      ?.sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      ?.map((offender) => {
        const alerts = alertFlagLabels.filter((alertFlag) =>
          alertFlag.alertCodes.some((alert) => offender.alerts && offender.alerts.includes(alert))
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
      livingUnitName: response?.location,
    })
  }
