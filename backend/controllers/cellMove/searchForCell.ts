// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alertFlagL... Remove this comment to see the full error message
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst, formatName, formatLocation } = require('../../utils')
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userHasAcc... Remove this comment to see the full error message
  userHasAccess,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getNonAsso... Remove this comment to see the full error message
  getNonAssocationsInEstablishment,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'renderLoca... Remove this comment to see the full error message
  renderLocationOptions,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cellAttrib... Remove this comment to see the full error message
  cellAttributes,
} = require('./cellMoveUtils')

module.exports =
  ({ oauthApi, prisonApi, whereaboutsApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const [userCaseLoads, userRoles] = await Promise.all([
        prisonApi.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])
      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo, true)

      if (!userHasAccess({ userRoles, userCaseLoads, offenderCaseload: prisonerDetails.agencyId })) {
        return res.render('notFound.njk', { url: '/prisoner-search' })
      }

      const nonAssociations = await prisonApi.getNonAssociations(res.locals, prisonerDetails.bookingId)
      const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

      const prisonersActiveAlertCodes = prisonerDetails.alerts
        .filter((alert) => !alert.expired)
        .map((alert) => alert.alertCode)
      const alertsToShow = alertFlagLabels.filter((alertFlag) =>
        alertFlag.alertCodes.some(
          (alert) => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
        )
      )
      const numberOfNonAssociations = getNonAssocationsInEstablishment(nonAssociations).length

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
        offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/offender-details`,
        csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
        formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
        profileUrl: `/prisoner/${offenderNo}`,
      })
    } catch (error) {
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
