import logger from '../log'

const removeDuplicates = (array) => [...new Set(array)]

export const offenderLoaderFactory = (prisonApi) => {
  const loadFromCsvContent = async (context, rows, agencyId) => {
    logger.debug(`Csv file was imported with ${rows.length} rows of data`)
    const offenderNumbers = removeDuplicates(rows.map((row) => row[0]))
    const offenders = await prisonApi.getBasicInmateDetailsForOffenders(context, offenderNumbers)

    if (!offenders) return []

    return offenderNumbers
      .map((number) => offenders.find((offender) => offender.offenderNo === number))
      .filter((offender) => Boolean(offender) && offender.agencyId === agencyId)
  }
  return {
    loadFromCsvContent,
  }
}

export default {
  offenderLoaderFactory,
}
