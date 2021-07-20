// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alertFlagL... Remove this comment to see the full error message
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst, formatLocation, formatName } = require('../../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisonApiL... Remove this comment to see the full error message
const prisonApiLocationDescription = async (res, whereaboutsApi, locationKey, userCaseLoad) => {
  const fullLocationPrefix = await whereaboutsApi.getAgencyGroupLocationPrefix(res.locals, userCaseLoad, locationKey)
  if (fullLocationPrefix) {
    const locationIdWithSuffix = fullLocationPrefix.locationPrefix
    return locationIdWithSuffix?.length < 1 ? '' : locationIdWithSuffix.slice(0, -1)
  }
  return `${userCaseLoad}-${locationKey}`
}

module.exports =
  ({ prisonApi, whereaboutsApi }) =>
  async (req, res) => {
    const {
      user: { activeCaseLoad },
    } = res.locals
    const { location } = req.query

    const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

    const locationsData = await whereaboutsApi.searchGroups(res.locals, currentUserCaseLoad)
    const locationOptions = [
      { text: 'Select', value: 'SELECT' },
      ...locationsData.map((locationData) => ({ text: locationData.name, value: locationData.key })),
    ]

    const hasSearched = location !== undefined
    if (!hasSearched) {
      return res.render('cellMove/cellMoveViewResidentialLocation.njk', {
        showResults: false,
        locationOptions,
      })
    }

    const noLocationSelected = location === 'SELECT'
    if (noLocationSelected) {
      const noLocationSelectedError = {
        href: '#location',
        text: 'Select a residential location',
      }
      return res.render('cellMove/cellMoveViewResidentialLocation.njk', {
        showResults: false,
        locationOptions,
        errors: [noLocationSelectedError],
      })
    }

    const locationDesc = await prisonApiLocationDescription(res, whereaboutsApi, location, currentUserCaseLoad)

    const context = {
      ...res.locals,
      requestHeaders: {
        'Page-Limit': '5000',
        'Sort-Fields': 'lastName,firstName',
        'Sort-Order': 'ASC',
      },
    }
    const prisoners = await prisonApi.getInmates(context, locationDesc, {
      returnAlerts: 'true',
    })

    const results =
      prisoners &&
      prisoners.map((prisoner) => ({
        ...prisoner,
        assignedLivingUnitDesc: formatLocation(prisoner.assignedLivingUnitDesc),
        name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
        formattedName: formatName(prisoner.firstName, prisoner.lastName),
        alerts: alertFlagLabels.filter((alertFlag) =>
          alertFlag.alertCodes.some(
            (alert) => prisoner.alertsDetails?.includes(alert) && cellMoveAlertCodes.includes(alert)
          )
        ),
        cellHistoryUrl: `/prisoner/${prisoner.offenderNo}/cell-history`,
        cellSearchUrl: `/prisoner/${prisoner.offenderNo}/cell-move/search-for-cell`,
      }))

    return res.render('cellMove/cellMoveViewResidentialLocation.njk', {
      showResults: true,
      formValues: { ...req.query },
      locationOptions,
      results,
      totalOffenders: results.length,
    })
  }
