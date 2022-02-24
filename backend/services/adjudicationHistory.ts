import moment from 'moment'
import { nanoid } from 'nanoid'

import {
  formatName,
  formatMonthsAndDays,
  formatTimestampToDateTime,
  formatTimestampToDate,
  sortByDateTime,
} from '../utils'

const AdjudciationHistoryServiceFactory = (prisonApi) => {
  const getAdjudications = async (context, offenderNumber, params, pageOffsetOption, perPage) => {
    const { requestHeaders, ...withoutPagination } = context

    const [adjudications, findingTypes] = await Promise.all([
      prisonApi.getAdjudications(context, offenderNumber, params, pageOffsetOption, perPage),
      prisonApi.getAdjudicationFindingTypes(withoutPagination),
    ])

    const establishments = adjudications.agencies.reduce(
      (accumulator, target) => ({ ...accumulator, [target.agencyId]: target.description }),
      {}
    )

    const ordercharges = adjudications.results.map((result) => {
      const { adjudicationCharges, ...fields } = result
      const charge = adjudicationCharges.filter((item) => item.findingCode).pop()
      const finding = findingTypes.find((type) => charge && type.code === charge.findingCode)

      return {
        ...fields,
        establishment: establishments[result.agencyId],
        reportDate: moment(result.reportTime).format('DD/MM/YYYY'),
        reportTime: moment(result.reportTime).format('HH:mm'),
        ...charge,
        findingDescription: (finding && finding.description) || 'Not entered',
      }
    })
    return {
      ...adjudications,
      findingTypes,
      results: ordercharges,
    }
  }

  const extractHearingAndResults = (hearings) => {
    if (hearings.length === 0) {
      return [undefined, []]
    }
    const firstHearing = hearings[0]
    const { heardByFirstName, heardByLastName, results = [], ...hearing } = firstHearing

    return [
      {
        ...hearing,
        hearingTime: formatTimestampToDateTime(hearing.hearingTime),
        heardByName: formatName(heardByFirstName, heardByLastName),
      },
      results,
    ]
  }

  const extractSanctions = (results) => {
    const [{ sanctions = [] } = {}] = results

    return sanctions
      .sort((left, right) => sortByDateTime(right.effectiveDate, left.effectiveDate))
      .map((sanction) => ({
        ...sanction,
        duration: formatMonthsAndDays(sanction.sanctionMonths, sanction.sanctionDays),
        effectiveDate: formatTimestampToDate(sanction.effectiveDate),
        statusDate: formatTimestampToDate(sanction.statusDate),
      }))
  }

  const getAdjudicationDetails = async (context, offenderNumber, adjudicationNumber) => {
    const details = await prisonApi.getAdjudicationDetails(context, offenderNumber, adjudicationNumber)
    const { hearings = [], ...otherDetails } = details

    const [hearing, results] = extractHearingAndResults(hearings)
    const sanctions = extractSanctions(results)

    return {
      ...otherDetails,
      incidentTime: formatTimestampToDateTime(otherDetails.incidentTime),
      reportTime: formatTimestampToDateTime(otherDetails.reportTime),
      reporterName: formatName(details.reporterFirstName, details.reporterLastName),
      hearing,
      results: results.map(({ sanctions: ignored, ...rest }) => rest).map((result) => ({ id: nanoid(), ...result })),
      sanctions: sanctions.map((sanction) => ({ id: nanoid(), ...sanction })),
    }
  }

  return {
    getAdjudications,
    getAdjudicationDetails,
  }
}

export default AdjudciationHistoryServiceFactory
