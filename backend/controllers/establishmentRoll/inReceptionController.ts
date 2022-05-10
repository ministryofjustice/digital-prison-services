import moment from 'moment'
import { putLastNameFirst } from '../../utils'
import { alertFlagLabels } from '../../shared/alertFlagValues'

export default ({ movementsService, logError }) =>
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
