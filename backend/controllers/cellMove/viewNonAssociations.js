const moment = require('moment')

const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst, formatName } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const { bookingId, firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)
    const nonAssociations = await elite2Api.getNonAssociations(res.locals, bookingId)

    const nonAssocationsInEstablishment =
      nonAssociations &&
      nonAssociations.nonAssociations &&
      nonAssociations.nonAssociations
        .filter(
          nonAssociation =>
            nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
              nonAssociations.agencyDescription.toLowerCase() &&
            (!nonAssociation.expiryDate || nonAssociation.expiryDate > moment())
        )
        .sort((left, right) => {
          if (left.effectiveDate > right.effectiveDate) return 1
          if (right.effectiveDate > left.effectiveDate) return -1
          if (left.offenderNonAssociation.lastName > right.offenderNonAssociation.lastName) return 1
          if (right.offenderNonAssociation.lastName > left.offenderNonAssociation.lastName) return -1
          return 0
        })

    const nonAssociationsRows =
      nonAssocationsInEstablishment &&
      nonAssocationsInEstablishment.map(nonAssociation => {
        return {
          name: formatName(
            nonAssociation.offenderNonAssociation.firstName,
            nonAssociation.offenderNonAssociation.lastName
          ),
          prisonNumber: nonAssociation.offenderNonAssociation.offenderNo,
          location: nonAssociation.offenderNonAssociation.assignedLivingUnitDescription,
          type: nonAssociation.typeDescription,
          selectedOffenderKey: `${formatName(firstName, lastName)} is`,
          selectedOffenderRole: nonAssociation.reasonDescription,
          otherOffenderKey: `${formatName(
            nonAssociation.offenderNonAssociation.firstName,
            nonAssociation.offenderNonAssociation.lastName
          )} is`,
          otherOffenderRole: nonAssociation.offenderNonAssociation.reasonDescription,
          comment: nonAssociation.comments,
          effectiveDate: moment(nonAssociation.effectiveDate).format('D MMMM YYYY'),
        }
      })

    return res.render('cellMove/nonAssociations.njk', {
      nonAssociationsRows,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      prisonerName: formatName(firstName, lastName),
      dpsUrl,
      selectLocationLink: `/prisoner/${offenderNo}/cell-move/select-location`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/non-associations`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
