const { parseCsvData } = require('../csv-parser')

const offenderLoaderFactory = eliteApi => {
  const loadFromCsvContent = async (context, content) => {
    const rows = await parseCsvData(content)
    const offenderNumbers = rows.map(row => row[0])
    const offenders = await eliteApi.getBasicInmateDetailsForOffenders(context, offenderNumbers)

    if (!offenders) return []

    return offenders.filter(offender => offender).map(offender => ({
      ...offender,
      startTime: rows.find(row => row[0] === offender.offenderNo)[1],
    }))
  }
  return {
    loadFromCsvContent,
  }
}

module.exports = {
  offenderLoaderFactory,
}
