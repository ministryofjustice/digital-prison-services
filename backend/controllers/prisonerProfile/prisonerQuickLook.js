const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { formatTimestampToDate, formatCurrency } = require('../../utils')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  try {
    const { offenderNo } = req.params
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId } = details

    const [prisonerProfileData, offenceData, balanceData, prisonerData, sentenceData] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getMainOffence(res.locals, bookingId),
      elite2Api.getPrisonerBalances(res.locals, bookingId),
      elite2Api.getPrisonerDetails(res.locals, offenderNo),
      elite2Api.getPrisonerSentenceDetails(res.locals, offenderNo),
    ])

    const prisoner = Boolean(prisonerData.length) && prisonerData[0]

    const { sentenceDetail } = sentenceData
    const offenceDetails = [
      { label: 'Main offence(s)', value: Boolean(offenceData.length) && offenceData[0].offenceDescription },
      { label: 'Imprisonment status', value: prisoner && prisoner.imprisonmentStatusDesc },
      {
        label: 'Release date',
        value: sentenceDetail && sentenceDetail.releaseDate && formatTimestampToDate(sentenceDetail.releaseDate),
      },
    ]

    const { currency } = balanceData
    const balanceDetails = [
      { label: 'Spends', value: formatCurrency(balanceData.spends, currency) },
      { label: 'Private', value: formatCurrency(balanceData.cash, currency) },
      { label: 'Savings', value: formatCurrency(balanceData.savings, currency) },
    ]

    const personalDetails = [
      { label: 'Age', value: prisoner.dateOfBirth && moment().diff(moment(prisoner.dateOfBirth), 'years') },
      { label: 'Nationality', value: prisoner.nationalities },
      { label: 'PNC number', value: prisoner.pncNumber },
      { label: 'CRO number', value: prisoner.croNumber },
    ]

    return res.render('prisonerProfile/prisonerQuickLook.njk', {
      prisonerProfileData,
      offenceDetails,
      balanceDetails,
      personalDetails,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: dpsUrl })
  }
}
