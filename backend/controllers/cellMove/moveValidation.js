const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatName, possessive, indefiniteArticle } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const getValueByType = require('../../shared/getValueByType')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { cellId } = req.query

  const getOccupantsDetails = async offenders => {
    return Promise.all(offenders.map(offender => elite2Api.getDetails(res.locals, offender, true)))
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

  try {
    const occupants = await elite2Api.getInmatesAtLocation(res.locals, cellId, {})
    const currentOccupantsOffenderNos = occupants.map(occupant => occupant.offenderNo)
    const currentOccupantsDetails = occupants && (await getOccupantsDetails(currentOccupantsOffenderNos))
    const currentOffenderDetails = await elite2Api.getDetails(res.locals, offenderNo, true)
    const currentOffenderNonAssociations = await elite2Api.getNonAssociations(
      res.locals,
      currentOffenderDetails.bookingId
    )
    const currentOffenderSexuality = getValueByType('SEXO', currentOffenderDetails.profileInformation, 'resultValue')
    const currentOccupantsSexualities = currentOccupantsDetails.map(currentOccupant => {
      console.log(currentOccupant.profileInformation)
      return getValueByType('SEXO', currentOccupant.profileInformation, 'resultValue')
    })

    console.log(currentOccupantsSexualities)

    const currentOffenderActiveAlerts = currentOffenderDetails.alerts
      .filter(alert => !alert.expired && cellMoveAlertCodes.includes(alert.alertCode))
      .map(alert => {
        const sexualitiesString = currentOccupantsSexualities
          .filter(sexuality => sexuality && !sexuality.toLowerCase().includes('hetero'))
          .join(', ')
        const title =
          alert.alertCode === 'RLG' &&
          currentOccupantsSexualities.some(
            sexuality => (sexuality && !sexuality.toLowerCase().includes('hetero')) || !sexuality
          )
            ? `who has ${indefiniteArticle(alert.alertCodeDescription)} ${
                alert.alertCodeDescription
              } alert into a cell with a prisoner who has a sexual orientation of ${sexualitiesString || 'unknown'}`
            : `who has ${indefiniteArticle(alert.alertCodeDescription)} ${
                alert.alertCodeDescription
              } alert into a cell with another prisoner`
        return {
          subTitle:
            alert.comment &&
            `The details of ${formatName(
              currentOffenderDetails.firstName,
              currentOffenderDetails.lastName
            )}${possessive(currentOffenderDetails.lastName)} alert are`,
          title,
          comment: alert.comment,
          date: `Date added: ${moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY')}`,
        }
      })

    const currentOccupantsActiveAlerts = currentOccupantsDetails
      .map(currentOccupant =>
        currentOccupant.alerts
          .filter(alert => !alert.expired && cellMoveAlertCodes.includes(alert.alertCode))
          .map(alert => {
            const title =
              alert.alertCode === 'RLG' &&
              ((currentOffenderSexuality && !currentOffenderSexuality.toLowerCase().includes('hetero')) ||
                !currentOffenderSexuality)
                ? `who has a sexual orientation of ${currentOffenderSexuality ||
                    'unknown'} into a cell with a prisoner who has ${indefiniteArticle(alert.alertCodeDescription)} ${
                    alert.alertCodeDescription
                  } alert`
                : `into a cell with a prisoner who has ${indefiniteArticle(alert.alertCodeDescription)} ${
                    alert.alertCodeDescription
                  } alert`
            return {
              code: alert.alertCode,
              subTitle:
                alert.comment &&
                `The details of ${formatName(currentOccupant.firstName, currentOccupant.lastName)}${possessive(
                  currentOccupant.lastName
                )} alert are`,
              title,
              comment: alert.comment,
              date: `Date added: ${moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY')}`,
            }
          })
      )
      .flatMap(alert => alert)

    const csraWarningMessage = getCellSharingRiskAssessmentMessage(currentOffenderDetails, currentOccupantsDetails)
    const nonAssociations =
      currentOffenderNonAssociations &&
      currentOffenderNonAssociations.nonAssociations &&
      currentOffenderNonAssociations.nonAssociations.map(nonAssociation => ({
        name: `${nonAssociation.offenderNonAssociation.lastName}, ${nonAssociation.offenderNonAssociation.firstName}`,
        prisonNumber: nonAssociation.offenderNonAssociation.offenderNo,
        location:
          nonAssociation.offenderNonAssociation.assignedLivingUnitDescription ||
          nonAssociation.offenderNonAssociation.agencyDescription,
        type: nonAssociation.typeDescription,
        reason: nonAssociation.offenderNonAssociation.reasonDescription,
        comment: nonAssociation.comments || 'None entered',
      }))

    return res.render('cellMove/moveValidation.njk', {
      breadcrumbPrisonerName: putLastNameFirst(currentOffenderDetails.firstName, currentOffenderDetails.lastName),
      currentOffenderDetails,
      offenderNo,
      offenderName: `${formatName(currentOffenderDetails.firstName, currentOffenderDetails.lastName)}`,
      csraWarningMessage,
      nonAssociations,
      currentOffenderActiveAlerts,
      currentOccupantsActiveAlerts,
      dpsUrl,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
