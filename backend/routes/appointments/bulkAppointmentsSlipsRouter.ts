import { chunkArray, forenameToInitial } from '../../utils'
import { serviceUnavailableMessage } from '../../common-messages'

export default ({ prisonApi, logError }) =>
  async (req, res) => {
    const renderError = (error) => {
      if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

      return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
    }

    const { appointmentDetails, prisonersListed } = req.session.appointmentSlipsData

    if (!appointmentDetails || !prisonersListed) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      return renderError()
    }

    const { userDetails } = req.session

    const createdBy = forenameToInitial(userDetails.name)
    const offenderNumbers = prisonersListed.map((prisoner) => prisoner.offenderNo)
    const chunkedOffenderNumbers = chunkArray(offenderNumbers, 100)

    const chunkedOffenders = chunkedOffenderNumbers.map((offendersChunk) => ({
      offenders: offendersChunk,
    }))

    const offenderSummaries = (
      await Promise.all(
        chunkedOffenders.map((apiCall) => prisonApi.getOffenderSummaries(res.locals, apiCall.offenders))
      )
    )
      .map((offenderSummaryData) => offenderSummaryData.content)
      .reduce((flattenedOffenders, offender) => flattenedOffenders.concat(offender), [])

    console.error({ offenderSummaries })

    const prisonersListedWithCellInfo = prisonersListed.map((prisoner) => {
      const prisonerDetails = offenderSummaries.find((offender) => prisoner?.offenderNo === offender?.offenderNo)

      return {
        ...prisoner,
        assignedLivingUnitDesc: prisonerDetails && prisonerDetails.assignedLivingUnitDesc,
      }
    })

    return res.render('movementSlipsPage.njk', {
      appointmentDetails: { ...appointmentDetails, createdBy, prisonersListed: prisonersListedWithCellInfo },
    })
  }
