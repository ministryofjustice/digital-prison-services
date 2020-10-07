const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatName, possessive, indefiniteArticle, hasLength } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const getValueByType = require('../../shared/getValueByType')

const moveValidationFactory = ({ elite2Api, logError }) => {
  const getOccupantsDetails = async (context, offenders) => {
    return Promise.all(offenders.map(offender => elite2Api.getDetails(context, offender, true)))
  }

  const getCellSharingRiskAssessmentMessage = (offender, currentOccupants) => {
    const occupantsCsraValues = currentOccupants
      .filter(currentOccupant => currentOccupant.csra)
      .map(currentOccupant => currentOccupant.csra)
    if (offender.csra && offender.csra === 'High' && occupantsCsraValues.includes('High')) {
      return 'who is CSRA high into a cell with a prisoner who is CSRA high'
    }

    if (offender.csra && offender.csra === 'High' && !occupantsCsraValues.includes('High')) {
      return 'who is CSRA high into a cell with a prisoner who is CSRA standard'
    }

    if (offender.csra && offender.csra === 'Standard' && occupantsCsraValues.includes('High')) {
      return 'who is CSRA standard into a cell with a prisoner who is CSRA high'
    }

    return null
  }

  const getCurrentOffenderAlertTitle = (alert, sexualities, anyNonHetero) => {
    if (alert.alertCode === 'RLG' && anyNonHetero) {
      const sexualitiesString = sexualities
        .filter(sexuality => sexuality && !sexuality.toLowerCase().includes('hetero'))
        .join(', ')
      return `who has ${indefiniteArticle(alert.alertCodeDescription)} ${
        alert.alertCodeDescription
      } alert into a cell with a prisoner who has a sexual orientation of ${sexualitiesString}`
    }

    if (alert.alertCode === 'XEL') return 'who is an E-List prisoner into a cell with another prisoner'

    return `who has ${indefiniteArticle(alert.alertCodeDescription)} ${
      alert.alertCodeDescription
    } alert into a cell with another prisoner`
  }

  const getOffenderAlertBody = (alert, title, firstName, lastName) => {
    return {
      subTitle: alert.comment && `The details of ${possessive(formatName(firstName, lastName))} alert are`,
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
      const currentOffenderDetails = await elite2Api.getDetails(res.locals, offenderNo, true)

      const occupants = await elite2Api.getInmatesAtLocation(res.locals, cellId, {})
      const currentOccupantsOffenderNos = occupants.map(occupant => occupant.offenderNo)
      const currentOccupantsDetails = occupants && (await getOccupantsDetails(res.locals, currentOccupantsOffenderNos))

      // Get the residential unit level prefix for the selected cell by traversing up the
      // parent location tree
      const locationDetail = await elite2Api.getLocation(res.locals, cellId)
      const parentLocationDetail = await elite2Api.getLocation(res.locals, locationDetail.parentLocationId)
      const { locationPrefix } = await elite2Api.getLocation(res.locals, parentLocationDetail.parentLocationId)

      // Get non-associations for the offener and filter them down to ones
      // that are currently in the same residential unit as the selected cell
      const currentOffenderNonAssociations = await elite2Api.getNonAssociations(
        res.locals,
        currentOffenderDetails.bookingId
      )
      const nonAssociations =
        currentOffenderNonAssociations &&
        currentOffenderNonAssociations.nonAssociations &&
        currentOffenderNonAssociations.nonAssociations
          .filter(
            nonAssociation =>
              nonAssociation.offenderNonAssociation.assignedLivingUnitDescription &&
              nonAssociation.offenderNonAssociation.assignedLivingUnitDescription.includes(locationPrefix)
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

      // Get Cell Sharing Risk Assessment warnings of any
      const csraWarningMessage =
        currentOccupantsDetails.length > 0 &&
        getCellSharingRiskAssessmentMessage(currentOffenderDetails, currentOccupantsDetails)

      // Get a list of sexualities involved
      const currentOffenderSexuality = getValueByType('SEXO', currentOffenderDetails.profileInformation, 'resultValue')
      const currentOffenderNonHetero = currentOffenderSexuality && currentOffenderSexuality.includes('hetero')
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

      // Get the list of relevant offender alerts
      const currentOffenderActiveAlerts =
        currentOccupantsDetails.length > 0 &&
        currentOffenderDetails.alerts
          .filter(alert => !alert.expired && cellMoveAlertCodes.includes(alert.alertCode) && alert.alertCode !== 'PEEP')
          .filter(alert => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && anyNonHetero))
          .map(alert => {
            const title = getCurrentOffenderAlertTitle(alert, currentOccupantsSexualities, anyNonHetero)
            return getOffenderAlertBody(alert, title, currentOffenderDetails.firstName, currentOffenderDetails.lastName)
          })

      // Get the list of relevant occupant alerts
      const currentOccupantsActiveAlerts = currentOccupantsDetails
        .map(currentOccupant =>
          currentOccupant.alerts
            .filter(
              alert => !alert.expired && cellMoveAlertCodes.includes(alert.alertCode) && alert.alertCode !== 'PEEP'
            )
            .filter(alert => alert.alertCode !== 'RLG' || (alert.alertCode === 'RLG' && currentOffenderNonHetero))
            .map(alert => {
              const title =
                alert.alertCode === 'RLG' && currentOffenderNonHetero
                  ? `who has a sexual orientation of ${currentOffenderSexuality} into a cell with a prisoner who has ${indefiniteArticle(
                      alert.alertCodeDescription
                    )} ${alert.alertCodeDescription} alert`
                  : `into a cell with a prisoner who has ${indefiniteArticle(alert.alertCodeDescription)} ${
                      alert.alertCodeDescription
                    } alert`
              return getOffenderAlertBody(alert, title, currentOccupant.firstName, currentOccupant.lastName)
            })
        )
        .flatMap(alert => alert)

      const categoryWarning = currentOccupantsDetails.length > 0 && currentOffenderDetails.categoryCode === 'A'

      if (
        !categoryWarning &&
        !hasLength(nonAssociations) &&
        !hasLength(currentOffenderActiveAlerts) &&
        !hasLength(currentOccupantsActiveAlerts) &&
        !csraWarningMessage
      ) {
        return res.redirect(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
      }

      return res.render('cellMove/moveValidation.njk', {
        offenderNo,
        offenderName: `${formatName(currentOffenderDetails.firstName, currentOffenderDetails.lastName)}`,
        csraWarningMessage,
        nonAssociations,
        currentOffenderActiveAlerts,
        currentOccupantsActiveAlerts,
        categoryWarning,
        showRisks: currentOffenderActiveAlerts.length > 0 || currentOccupantsActiveAlerts.length > 0 || categoryWarning,
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

module.exports = {
  moveValidationFactory,
}
