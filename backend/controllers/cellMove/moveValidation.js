const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatName, indefiniteArticle, hasLength } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const getValueByType = require('../../shared/getValueByType')

const moveValidationFactory = ({ prisonApi, logError }) => {
  const getOccupantsDetails = async (context, offenders) => {
    return Promise.all(offenders.map(offender => prisonApi.getDetails(context, offender, true)))
  }

  const alertString = alertDescription => `${indefiniteArticle(alertDescription)} ${alertDescription} alert`

  const getCurrentOffenderAlertTitle = (alert, sexualities, anyNonHetero) => {
    if (alert.alertCode === 'RLG' && anyNonHetero) {
      const sexualitiesString = sexualities
        .filter(sexuality => sexuality && !sexuality.toLowerCase().includes('hetero'))
        .join(', ')
      return `${alertString(
        alert.alertCodeDescription
      )} into a cell with a prisoner who has a sexual orientation of ${sexualitiesString}`
    }

    return alertString(alert.alertCodeDescription)
  }

  const getOffenderAlertBody = (alert, title) => {
    return {
      title,
      comment: alert.comment,
      date: `Date added: ${moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY')}`,
    }
  }

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
      const nonAssociations = currentOffenderNonAssociations?.nonAssociations
        ?.filter(nonAssociation =>
          nonAssociation.offenderNonAssociation.assignedLivingUnitDescription?.includes(locationPrefix)
        )
        .map(nonAssociation => ({
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
        }))

      const currentOffenderWithOccupants = [currentOffenderDetails, ...currentOccupantsDetails]

      const offendersCsraValues = currentOffenderWithOccupants
        .filter(currentOccupant => currentOccupant.csra)
        .map(currentOccupant => currentOccupant.csra)

      const offendersNamesWithCsra = currentOffenderWithOccupants
        .filter(offender => offender.csra)
        .map(offender => `${formatName(offender.firstName, offender.lastName)} is CSRA ${offender.csra.toLowerCase()}`)

      // Get a list of sexualities involved
      const currentOffenderSexuality = getValueByType('SEXO', currentOffenderDetails.profileInformation, 'resultValue')
      const currentOffenderNonHetero = currentOffenderSexuality?.includes('hetero')
      const currentOccupantsSexualities = [
        ...new Set(
          currentOccupantsDetails.map(currentOccupant =>
            getValueByType('SEXO', currentOccupant.profileInformation, 'resultValue')
          )
        ),
      ]
      const anyNonHetero = currentOccupantsSexualities.some(
        sexuality => sexuality && !sexuality.toLowerCase().includes('hetero')
      )

      const activeCellMoveNonDisabledAlert = alert =>
        !alert.expired && cellMoveAlertCodes.includes(alert.alertCode) && alert.alertCode !== 'PEEP'

      // Get the list of relevant offender alerts
      const currentOffenderActiveAlerts =
        currentOccupantsDetails.length > 0 &&
        currentOffenderDetails.alerts
          .filter(activeCellMoveNonDisabledAlert)
          .filter(alert => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && anyNonHetero))
          .map(alert => {
            const title = getCurrentOffenderAlertTitle(alert, currentOccupantsSexualities, anyNonHetero)

            return getOffenderAlertBody(alert, title, currentOffenderDetails.firstName, currentOffenderDetails.lastName)
          })

      const currentOccupantsWithFormattedActiveAlerts = currentOccupantsDetails
        .map(currentOccupant => {
          return {
            name: formatName(currentOccupant.firstName, currentOccupant.lastName),
            alerts: currentOccupant.alerts
              .filter(activeCellMoveNonDisabledAlert)
              .filter(alert => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && currentOffenderNonHetero))
              .map(alert => {
                const title =
                  alert.alertCode === 'RLG' && currentOffenderNonHetero
                    ? `a sexual orientation of ${currentOffenderSexuality} into a cell with a prisoner who has ${alertString(
                        alert.alertCodeDescription
                      )}`
                    : `${alertString(alert.alertCodeDescription)}`

                return getOffenderAlertBody(alert, title, currentOccupant.firstName, currentOccupant.lastName)
              }),
          }
        })
        .filter(occupant => occupant.alerts.length)

      const categoryWarning = currentOccupantsDetails.length > 0 && currentOffenderDetails.categoryCode === 'A'

      if (
        !categoryWarning &&
        !hasLength(nonAssociations) &&
        !hasLength(currentOffenderActiveAlerts) &&
        !hasLength(currentOccupantsWithFormattedActiveAlerts) &&
        !hasLength(cellSharingRiskAssessments)
      ) {
        return res.redirect(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
      }

      const profileUrl = `/prisoner/${offenderNo}`

      return res.render('cellMove/moveValidation.njk', {
        offenderNo,
        offenderName: `${formatName(currentOffenderDetails.firstName, currentOffenderDetails.lastName)}`,
        prisonerNameForBreadcrumb: putLastNameFirst(currentOffenderDetails.firstName, currentOffenderDetails.lastName),
        profileUrl,
        selectCellUrl: `${profileUrl}/cell-move/select-cell`,
        showOffendersNamesWithCsra: offendersCsraValues.includes('High'),
        offendersNamesWithCsra,
        nonAssociations,
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
      console.log({ error })
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

module.exports = {
  moveValidationFactory,
}
