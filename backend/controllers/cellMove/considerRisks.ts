import moment from 'moment'
import { cellMoveAlertCodes } from '../../shared/alertFlagValues'

import { putLastNameFirst, formatName, indefiniteArticle, hasLength, createStringFromList } from '../../utils'

import getValueByType from '../../shared/getValueByType'
import { translateCsra } from './cellMoveUtils'

const activeCellMoveAlertsExcludingDisabled = (alert) =>
  !alert.expired && cellMoveAlertCodes.includes(alert.alertCode) && alert.alertCode !== 'PEEP'

const missingDataString = 'not entered'

export default ({ prisonApi, raiseAnalyticsEvent, nonAssociationsApi }) => {
  const getOccupantsDetails = async (context, offenders) =>
    Promise.all(offenders.map((offender) => prisonApi.getDetails(context, offender, true)))

  const alertString = (alertDescription) => `${indefiniteArticle(alertDescription)} ${alertDescription} alert`

  const getOffenderAlertBody = (alert, title) => ({
    title,
    comment: alert.comment,
    date: `Date added: ${moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY')}`,
  })

  const renderTemplate = async (req, res, pageData) => {
    const { offenderNo } = req.params
    const { cellId } = req.query
    const { errors } = pageData || {}

    try {
      const [currentOffenderDetails, occupants] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo, true),
        prisonApi.getInmatesAtLocation(res.locals, cellId, {}),
      ])

      const hasOccupants = occupants.length > 0
      const currentOccupantsOffenderNos = occupants.map((occupant) => occupant.offenderNo)
      const currentOccupantsDetails = occupants && (await getOccupantsDetails(res.locals, currentOccupantsOffenderNos))

      // Get the residential unit level prefix for the selected cell by traversing up the
      // parent location tree
      const locationDetail = await prisonApi.getLocation(res.locals, cellId)
      let nonAssociationsWithinLocation = []
      // reception does not have a parentLocationId
      if (locationDetail.parentLocationId) {
        const parentLocationDetail = await prisonApi.getLocation(res.locals, locationDetail.parentLocationId)
        const { locationPrefix } = await prisonApi.getLocation(res.locals, parentLocationDetail.parentLocationId)
        // Get non-associations for the offender and filter them down to ones
        // that are currently in the same residential unit as the selected cell
        const currentOffenderNonAssociations = await nonAssociationsApi.getNonAssociations(res.locals, offenderNo)
        nonAssociationsWithinLocation = currentOffenderNonAssociations?.nonAssociations?.filter((nonAssociation) =>
          nonAssociation.offenderNonAssociation.assignedLivingUnitDescription?.includes(locationPrefix)
        )
      }
      const currentOffenderWithOccupants = [currentOffenderDetails, ...currentOccupantsDetails]

      const offendersCsraValues = currentOffenderWithOccupants
        .filter((currentOccupant) => currentOccupant.csraClassificationCode)
        .map((currentOccupant) => translateCsra(currentOccupant.csraClassificationCode))

      const showOffendersNamesWithCsra = hasOccupants && offendersCsraValues.includes('High')

      const currentOccupantsFormattedNames = currentOccupantsDetails.map(({ firstName, lastName }) =>
        formatName(firstName, lastName)
      )

      const offendersFormattedNamesWithCsra = currentOffenderWithOccupants.map(
        ({ firstName, lastName, csraClassificationCode }) =>
          `${formatName(firstName, lastName)} is CSRA ${translateCsra(csraClassificationCode)}.`
      )

      const currentOffenderName = formatName(currentOffenderDetails.firstName, currentOffenderDetails.lastName)

      // Get a list of sexualities involved
      const currentOffenderSexuality =
        getValueByType('SEXO', currentOffenderDetails.profileInformation, 'resultValue') || missingDataString
      const currentOffenderIsNonHetero = !currentOffenderSexuality?.toLowerCase().includes('hetero')

      const currentNonHeteroOccupants = currentOccupantsDetails.filter(
        (currentOccupant) =>
          !getValueByType('SEXO', currentOccupant.profileInformation, 'resultValue')?.toLowerCase().includes('hetero')
      )

      const currentNonHeteroOccupantsWithName = currentNonHeteroOccupants.map(
        (currentOccupant) =>
          `${formatName(currentOccupant.firstName, currentOccupant.lastName)} has a sexual orientation of ${
            getValueByType('SEXO', currentOccupant.profileInformation, 'resultValue') || missingDataString
          }`
      )

      // Get the list of relevant offender alerts
      const currentOffenderActiveAlerts =
        currentOccupantsDetails.length > 0 &&
        currentOffenderDetails.alerts
          .filter(activeCellMoveAlertsExcludingDisabled)
          .filter(
            (alert) => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && currentNonHeteroOccupants.length)
          )
          .map((alert) => {
            const title =
              alert.alertCode === 'RLG' && currentNonHeteroOccupants.length
                ? `${alertString(alert.alertCodeDescription)} and ${createStringFromList(
                    currentNonHeteroOccupantsWithName
                  )}`
                : `${alertString(alert.alertCodeDescription)}`

            return getOffenderAlertBody(alert, title)
          })

      const currentOccupantsWithFormattedActiveAlerts = currentOccupantsDetails
        .map((currentOccupant) => ({
          name: formatName(currentOccupant.firstName, currentOccupant.lastName),
          alerts: currentOccupant.alerts
            .filter(activeCellMoveAlertsExcludingDisabled)
            .filter((alert) => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && currentOffenderIsNonHetero))
            .map((alert) => {
              const title =
                alert.alertCode === 'RLG' && currentOffenderIsNonHetero
                  ? `${alertString(
                      alert.alertCodeDescription
                    )} and ${currentOffenderName} has a sexual orientation of ${currentOffenderSexuality}`
                  : `${alertString(alert.alertCodeDescription)}`

              return getOffenderAlertBody(alert, title)
            }),
        }))
        .filter((occupant) => occupant.alerts.length)

      const currentOccupantsWithCatRating = currentOccupantsDetails.map(
        ({ firstName, lastName, categoryCode = missingDataString }) =>
          `${formatName(firstName, lastName)} is a Cat ${categoryCode}`
      )

      const categoryWarning =
        currentOccupantsDetails.length > 0 &&
        currentOffenderDetails.categoryCode === 'A' &&
        `a Cat A rating and ${createStringFromList(currentOccupantsWithCatRating)}`

      if (
        !categoryWarning &&
        !showOffendersNamesWithCsra &&
        !hasLength(nonAssociationsWithinLocation) &&
        !hasLength(currentOffenderActiveAlerts) &&
        !hasLength(currentOccupantsWithFormattedActiveAlerts)
      ) {
        return res.redirect(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
      }

      const profileUrl = `/prisoner/${offenderNo}`

      return res.render('cellMove/considerRisks.njk', {
        offenderNo,
        currentOffenderName,
        prisonerNameForBreadcrumb: putLastNameFirst(currentOffenderDetails.firstName, currentOffenderDetails.lastName),
        profileUrl,
        selectCellUrl: `${profileUrl}/cell-move/select-cell`,
        showOffendersNamesWithCsra,
        confirmationQuestionLabel: hasOccupants
          ? `Are you sure you want to move ${currentOffenderName} into a cell with ${createStringFromList(
              currentOccupantsFormattedNames
            )}?`
          : 'Are you sure you want to select this cell?',
        offendersFormattedNamesWithCsra,
        nonAssociations: nonAssociationsWithinLocation.map((nonAssociation) => ({
          name: `${putLastNameFirst(
            nonAssociation.offenderNonAssociation.firstName,
            nonAssociation.offenderNonAssociation.lastName
          )}`,
          prisonNumber: nonAssociation.offenderNonAssociation.offenderNo,
          location:
            nonAssociation.offenderNonAssociation.assignedLivingUnitDescription ||
            nonAssociation.offenderNonAssociation.agencyDescription,
          type: nonAssociation.typeDescription,
          reason: nonAssociation.offenderNonAssociation.reasonDescription,
          comment: nonAssociation.comments || 'None entered',
        })),
        currentOffenderActiveAlerts,
        currentOccupantsWithFormattedActiveAlerts,
        categoryWarning,
        showRisks:
          currentOffenderActiveAlerts.length > 0 ||
          currentOccupantsWithFormattedActiveAlerts.length > 0 ||
          categoryWarning,
        errors,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-history`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.query
    const redirectUrl = `/prisoner/${offenderNo}/cell-move/select-cell`

    try {
      const { confirmation } = req.body

      if (!confirmation)
        return renderTemplate(req, res, {
          errors: [{ text: 'Select yes if you are sure you want to select the cell', href: '#confirmation' }],
        })

      if (confirmation === 'yes')
        return res.redirect(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)

      const [currentOffenderDetails, occupants] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo, true),
        prisonApi.getInmatesAtLocation(res.locals, cellId, {}),
      ])

      const currentOccupantsOffenderNos = occupants.map((occupant) => occupant.offenderNo)
      const currentOccupantsDetails = occupants && (await getOccupantsDetails(res.locals, currentOccupantsOffenderNos))

      const offenderAlertCodes = currentOffenderDetails.alerts
        .map((alert) => alert)
        .filter(activeCellMoveAlertsExcludingDisabled)
        .map((alert) => alert.alertCode)
        .join(',')

      const alertCodesAssociatedWithOccupants = Array.from(
        new Set(
          currentOccupantsDetails
            .flatMap((occupant) => occupant)
            .flatMap((occupant) => occupant.alerts)
            .filter(activeCellMoveAlertsExcludingDisabled)
            .map((alert) => alert.alertCode)
        )
      ).join(',')

      raiseAnalyticsEvent(
        'Cancelled out of cell move',
        `Alerts codes for the offender moving in [${offenderAlertCodes}], Alerts for associated occupants: [${alertCodesAssociatedWithOccupants}]`,
        'Cell move'
      )

      return res.redirect(redirectUrl)
    } catch (error) {
      res.locals.redirectUrl = redirectUrl
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
  return { index, post }
}
