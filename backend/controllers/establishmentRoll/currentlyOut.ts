import { Request, Response } from 'express'
import moment from 'moment'
import { alertFlagLabels } from '../../shared/alertFlagValues'
import { putLastNameFirst, stripAgencyPrefix } from '../../utils'

export default ({ movementsService }) =>
  async (req: Request, res: Response) => {
    const { livingUnitId } = req.params
    const response = await movementsService.getOffendersCurrentlyOutOfLivingUnit(res.locals, livingUnitId)

    const results = response?.currentlyOut
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

    return res.render('establishmentRoll/currentlyOut.njk', {
      results,
      livingUnitName: response?.location,
    })
  }
