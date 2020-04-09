const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const controller = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  try {
    const { offenderNo } = req.params
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId } = details

    const [prisonerProfileData, offenceData] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getMainOffence(res.locals, bookingId),
    ])

    const offenceDetails = [
      {
        key: { text: 'Main offence(s)' },
        value: { text: Boolean(offenceData.length) && offenceData[0].offenceDescription },
      },
    ]

    return res.render('prisonerProfile/prisonerQuickLook.njk', {
      prisonerProfileData,
      offenceDetails,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: dpsUrl })
  }
}

module.exports = dependencies => controller(dependencies)
