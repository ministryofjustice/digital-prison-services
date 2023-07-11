import { alertFlagLabels, cellMoveAlertCodes } from '../../shared/alertFlagValues'
import { putLastNameFirst, formatName, formatLocation } from '../../utils'

import {
  userHasAccess,
  getNonAssociationsInEstablishment,
  renderLocationOptions,
  cellAttributes,
  translateCsra,
} from './cellMoveUtils'

export default ({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const userRoles = oauthApi.userRoles(res.locals)
      const userCaseLoads = await prisonApi.userCaseLoads(res.locals)

      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo, true)

      if (!userHasAccess({ userRoles, userCaseLoads, offenderCaseload: prisonerDetails.agencyId })) {
        return res.render('notFound.njk', { url: '/prisoner-search' })
      }

      const nonAssociations = await nonAssociationsApi.getNonAssociations(res.locals, offenderNo)
      const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

      const prisonersActiveAlertCodes = prisonerDetails.alerts
        .filter((alert) => !alert.expired)
        .map((alert) => alert.alertCode)
      const alertsToShow = alertFlagLabels.filter((alertFlag) =>
        alertFlag.alertCodes.some(
          (alert) => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
        )
      )
      const numberOfNonAssociations = getNonAssociationsInEstablishment(nonAssociations).length

      const prisonerDetailsWithFormattedLocation = {
        ...prisonerDetails,
        assignedLivingUnit: {
          ...prisonerDetails.assignedLivingUnit,
          description: formatLocation(prisonerDetails.assignedLivingUnit.description),
        },
      }

      return res.render('cellMove/searchForCell.njk', {
        breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        prisonerName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        numberOfNonAssociations,
        showNonAssociationsLink: numberOfNonAssociations > 0,
        alerts: alertsToShow,
        locations: renderLocationOptions(locationsData),
        cellAttributes,
        prisonerDetails: prisonerDetailsWithFormattedLocation,
        offenderNo,
        nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
        searchForCellRootUrl: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/prisoner-details`,
        csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
        formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
        profileUrl: `/prisoner/${offenderNo}`,
        convertedCsra: translateCsra(prisonerDetails.csraClassificationCode),
      })
    } catch (error) {
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
