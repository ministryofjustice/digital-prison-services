const moment = require('moment')

const AdjudciationHistoryServiceFactory = elite2Api => {
  const getAdjudications = async (context, offenderNumber, params) => {
    const { requestHeaders, ...withoutPagination } = context

    const [adjudications, findingTypes] = await Promise.all([
      elite2Api.getAdjudications(context, offenderNumber, params),
      elite2Api.getAdjudicationFindingTypes(withoutPagination),
    ])

    const establishments = adjudications.agencies.reduce(
      (accumulator, target) => ({ ...accumulator, [target.agencyId]: target.description }),
      {}
    )

    const ordercharges = adjudications.results.map(result => {
      const { adjudicationCharges, ...fields } = result
      const charge = adjudicationCharges.reduce((charge1, charge2) => (charge1.findingCode ? charge1 : charge2))
      const finding = findingTypes.find(type => type.code === charge.findingCode)

      return {
        ...fields,
        establishment: establishments[result.agencyId],
        reportDate: moment(result.reportTime).format('DD/MM/YYYY'),
        reportTime: moment(result.reportTime).format('HH:mm'),
        ...charge,
        findingDescription: (finding && finding.description) || '--',
      }
    })
    return {
      ...adjudications,
      results: ordercharges,
    }
  }

  return {
    getAdjudications,
  }
}

module.exports = AdjudciationHistoryServiceFactory
