const logger = require('../log')

const offenderLoaderFactory = eliteApi => {
  const loadFromCsvContent = async (context, rows) => {
    logger.info(`Csv file was imported with ${rows.length} rows of data`)
    const offenderNumbers = rows.map(row => row[0])
    const offenders = await eliteApi.getBasicInmateDetailsForOffenders(context, offenderNumbers)

    if (!offenders) return []

    return offenderNumbers
      .map(number => offenders.find(offender => offender.offenderNo === number))
      .filter(offender => Boolean(offender))
  }
  return {
    loadFromCsvContent,
  }
}

module.exports = {
  offenderLoaderFactory,
}
