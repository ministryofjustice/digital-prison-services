const logger = require('../log')
const { parseCsvData } = require('../csv-parser')

const offenderLoaderFactory = eliteApi => {
  const loadFromCsvContent = async (context, content) => {
    const rows = await parseCsvData(content)
    logger.info(`Csv file was imported with ${rows.length} rows of data`)
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
