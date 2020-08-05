const moment = require('moment')

const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst } = require('../../utils')
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
      nonAssociations.nonAssociations.filter(
        nonAssociation =>
          nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
            nonAssociations.agencyDescription.toLowerCase() &&
          (!nonAssociation.expiryDate || nonAssociation.expiryDate > moment())
      )

    return res.render('cellMove/nonAssociations.njk', {
      nonAssociations: nonAssocationsInEstablishment,
      offenderNo,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      dpsUrl,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/non-associations`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
