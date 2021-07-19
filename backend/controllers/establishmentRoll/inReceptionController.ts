// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alertFlagL... Remove this comment to see the full error message
const { alertFlagLabels } = require('../../shared/alertFlagValues')

module.exports =
  ({ movementsService }) =>
  async (req, res) => {
    const { activeCaseLoadId } = req.session.userDetails
    const offendersInReception = await movementsService.getOffendersInReception(res.locals, activeCaseLoadId)

    const offenders = offendersInReception
      .sort((left, right) => left.lastName.localeCompare(right.lastName, 'en', { ignorePunctuation: true }))
      .map((offender) => ({
        offenderNo: offender.offenderNo,
        dateOfBirth: moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        name: putLastNameFirst(offender.firstName, offender.lastName),
        fromAgencyDescription: offender.fromAgencyDescription,
        alerts: offender.alerts
          .map((alertCode) => alertFlagLabels.find((alertLabel) => alertLabel.alertCodes.includes(alertCode)))
          .filter(Boolean)
          .map((alertLabel) => ({ classes: alertLabel.classes, label: alertLabel.label })),
        iepLevel: offender.iepLevel,
        category: offender.category,
      }))

    return res.render('establishmentRoll/inReception.njk', {
      offenders,
    })
  }
