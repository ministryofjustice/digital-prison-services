const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatName, indefiniteArticle, hasLength, createStringFromList } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const getValueByType = require('../../shared/getValueByType')

module.exports = ({ prisonApi, logError }) => {
  const getOccupantsDetails = async (context, offenders) => {
    return Promise.all(offenders.map(offender => prisonApi.getDetails(context, offender, true)))
  }

  const alertString = alertDescription => `${indefiniteArticle(alertDescription)} ${alertDescription} alert.`

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

      const currentOccupantsOffenderNos = occupants.map(occupant => occupant.offenderNo)
      const currentOccupantsDetails = occupants && (await getOccupantsDetails(res.locals, currentOccupantsOffenderNos))

      // Get the residential unit level prefix for the selected cell by traversing up the
      // parent location tree
      const locationDetail = await prisonApi.getLocation(res.locals, cellId)
      const parentLocationDetail = await prisonApi.getLocation(res.locals, locationDetail.parentLocationId)
      const { locationPrefix } = await prisonApi.getLocation(res.locals, parentLocationDetail.parentLocationId)

      // Get non-associations for the offener and filter them down to ones
      // that are currently in the same residential unit as the selected cell
      const currentOffenderNonAssociations = await prisonApi.getNonAssociations(
        res.locals,
        currentOffenderDetails.bookingId
      )
      const nonAssociationsWithinLocation = currentOffenderNonAssociations?.nonAssociations?.filter(nonAssociation =>
        nonAssociation.offenderNonAssociation.assignedLivingUnitDescription?.includes(locationPrefix)
      )

      const currentOffenderWithOccupants = [currentOffenderDetails, ...currentOccupantsDetails]

      const offendersCsraValues = currentOffenderWithOccupants
        .filter(currentOccupant => currentOccupant.csra)
        .map(currentOccupant => currentOccupant.csra)

      const showOffendersNamesWithCsra = offendersCsraValues.includes('High')

      const currentOccupantsFormattedNames = currentOccupantsDetails.map(({ firstName, lastName }) =>
        formatName(firstName, lastName)
      )

      const offendersFormattedNamesWithCsra = currentOffenderWithOccupants.map(
        ({ firstName, lastName, csra = 'Not entered' }) => `${formatName(firstName, lastName)} is CSRA ${csra}`
      )

      // Get a list of sexualities involved
      const currentOffenderSexuality = getValueByType('SEXO', currentOffenderDetails.profileInformation, 'resultValue')
      const currentOffenderIsNonHetero = !currentOffenderSexuality?.toLowerCase().includes('hetero')

      const currentOccupantsSexualities = [
        ...new Set(
          currentOccupantsDetails.map(currentOccupant =>
            getValueByType('SEXO', currentOccupant.profileInformation, 'resultValue')
          )
        ),
      ]
      const cellHasNonHeteroOccupants = currentOccupantsSexualities.some(
        sexuality => sexuality && !sexuality.toLowerCase().includes('hetero')
      )

      const activeCellMoveAlertsExcludingDisabled = alert =>
        !alert.expired && cellMoveAlertCodes.includes(alert.alertCode) && alert.alertCode !== 'PEEP'

      const sexualitiesString = currentOccupantsSexualities
        .filter(sexuality => sexuality && !sexuality.toLowerCase().includes('hetero'))
        .join(', ')

      // Get the list of relevant offender alerts
      const currentOffenderActiveAlerts =
        currentOccupantsDetails.length > 0 &&
        currentOffenderDetails.alerts
          .filter(activeCellMoveAlertsExcludingDisabled)
          .filter(alert => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && cellHasNonHeteroOccupants))
          .map(alert => {
            const title =
              alert.alertCode === 'RLG' && cellHasNonHeteroOccupants
                ? `${alertString(
                    alert.alertCodeDescription
                  )} You have selected a cell with a prisoner who has a sexual orientation of ${sexualitiesString}.`
                : `${alertString(alert.alertCodeDescription)}`

            return getOffenderAlertBody(alert, title)
          })

      const currentOccupantsWithFormattedActiveAlerts = currentOccupantsDetails
        .map(currentOccupant => {
          return {
            name: formatName(currentOccupant.firstName, currentOccupant.lastName),
            alerts: currentOccupant.alerts
              .filter(activeCellMoveAlertsExcludingDisabled)
              .filter(alert => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && currentOffenderIsNonHetero))
              .map(alert => {
                const title =
                  alert.alertCode === 'RLG' && currentOffenderIsNonHetero
                    ? `${alertString(
                        alert.alertCodeDescription
                      )} You have selected a prisoner who has a sexual orientation of ${currentOffenderSexuality}.`
                    : `${alertString(alert.alertCodeDescription)}`

                return getOffenderAlertBody(alert, title)
              }),
          }
        })
        .filter(occupant => occupant.alerts.length)

      const categoryWarning = currentOccupantsDetails.length > 0 && currentOffenderDetails.categoryCode === 'A'

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
        offenderName: `${formatName(currentOffenderDetails.firstName, currentOffenderDetails.lastName)}`,
        prisonerNameForBreadcrumb: putLastNameFirst(currentOffenderDetails.firstName, currentOffenderDetails.lastName),
        profileUrl,
        selectCellUrl: `${profileUrl}/cell-move/select-cell`,
        showOffendersNamesWithCsra,
        stringListOfCurrentOccupantsNames: createStringFromList(currentOccupantsFormattedNames),
        offendersFormattedNamesWithCsra,
        nonAssociations: nonAssociationsWithinLocation.map(nonAssociation => ({
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
        dpsUrl,
      })
    } catch (error) {
      if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

      return res.render('error.njk', {
        url: `/prisoner/${offenderNo}/cell-history`,
        homeUrl: `/prisoner/${offenderNo}`,
      })
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.query

    const errors = []

    const { confirmation } = req.body

    if (!confirmation) {
      errors.push({ text: 'Select yes if you are sure you want to select the cell', href: '#confirmation' })
    }

    if (errors.length > 0) {
      return renderTemplate(req, res, { errors })
    }

    if (confirmation === 'yes') {
      return res.redirect(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
    }

    return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)
  }

  return { index, post }
}
