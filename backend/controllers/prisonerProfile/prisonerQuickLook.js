const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const controller = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  try {
    const context = res.locals
    const { offenderNo } = req.params
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId } = details

    const [headerDetails, offenceData] = await Promise.all([
      prisonerProfileService.getPrisonerHeader(res.locals, offenderNo),
      elite2Api.getMainOffence(context, bookingId),
    ])

    const offenceDetails = [
      {
        key: { text: 'Main offence(s)' },
        value: { text: Boolean(offenceData.length) && offenceData[0].offenceDescription },
      },
    ]

    return res.render('prisonerProfile/prisonerQuickLook.njk', {
      headerDetails,
      offenceDetails,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: dpsUrl })
  }
}

module.exports = dependencies => controller(dependencies)
