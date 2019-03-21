const logger = require('../log')

const removeDuplicates = array => [...new Set(array)]

const offenderLoaderFactory = eliteApi => {
  const loadFromCsvContent = async (context, rows, agencyId) => {
    logger.info(`Csv file was imported with ${rows.length} rows of data`)
    const offenderNumbers = removeDuplicates(rows.map(row => row[0]))
    const offenders = await eliteApi.getBasicInmateDetailsForOffenders(context, offenderNumbers)

    if (!offenders) return []

    return offenderNumbers
      .map(number => offenders.find(offender => offender.offenderNo === number))
      .filter(offender => Boolean(offender) && offender.agencyId === agencyId)
  }
  return {
    loadFromCsvContent,
  }
}

module.exports = {
  offenderLoaderFactory,
}
