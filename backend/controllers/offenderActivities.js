const { switchDateFormat } = require('../utils')

const offenderActivitesFactory = (elite2api, whereaboutsApi) => {
  const getMissingPrisoners = async (context, agencyId, date, timeSlot) => {
    const offenderActivities = await elite2api.getOffenderActivities(
      context,
      agencyId,
      switchDateFormat(date),
      timeSlot
    )

    return offenderActivities
  }

  return { getMissingPrisoners }
}

module.exports = { offenderActivitesFactory }

// eventOutcome: "ATT" paid
