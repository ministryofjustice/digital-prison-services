// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'qs'.
const qs = require('querystring')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'serviceUna... Remove this comment to see the full error message
const { serviceUnavailableMessage } = require('../../common-messages')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alertFlagL... Remove this comment to see the full error message
const { alertFlagLabels, profileAlertCodes } = require('../../shared/alertFlagValues')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst, hasLength, formatLocation } = require('../../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'trackEvent... Remove this comment to see the full error message
const trackEvent = (telemetry, results, searchQueries, username, activeCaseLoad) => {
  if (telemetry) {
    const offenderNos = results?.map((result) => result.offenderNo)
    // Remove empty terms and the alerts[] property (which is a duplicate of the alerts property)
    const searchTerms = Object.fromEntries(
      Object.entries(searchQueries).filter((entry) => entry[1] && entry[0] !== 'alerts[]')
    )

    telemetry.trackEvent({
      name: `PrisonerSearch`,
      properties: {
        offenderNos,
        filters: searchTerms,
        username,
        caseLoadId: activeCaseLoad?.caseLoadId,
      },
    })
  }
}

module.exports = ({ paginationService, prisonApi, telemetry, logError }) => {
  const index = async (req, res) => {
    const {
      user: { activeCaseLoad },
    } = res.locals
    const { username } = req.session.userDetails
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const {
      location,
      keywords,
      alerts,
      pageLimitOption,
      pageOffsetOption,
      view,
      sortFieldsWithOrder = 'lastName,firstName:ASC',
      viewAll,
    } = req.query

    const selectedAlerts = alerts && alerts.map((alert) => alert.split(',')).flat()
    const pageLimit = (pageLimitOption && parseInt(pageLimitOption, 10)) || 50
    const pageOffset = (pageOffsetOption && !viewAll && parseInt(pageOffsetOption, 10)) || 0
    const [sortFields, sortOrder] = sortFieldsWithOrder.split(':')

    const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

    const hasSearched = Boolean(Object.keys(req.query).length)

    if (hasSearched) req.session.prisonerSearchUrl = req.originalUrl

    try {
      const context = {
        ...res.locals,
        requestHeaders: {
          'Page-Offset': pageOffset,
          'Page-Limit': pageLimit,
          'Sort-Fields': sortFields,
          'Sort-Order': sortOrder,
        },
      }

      const [locations, prisoners] = await Promise.all([
        prisonApi.userLocations(res.locals),
        prisonApi.getInmates(context, location || currentUserCaseLoad, {
          keywords,
          alerts: selectedAlerts,
          returnIep: 'true',
          returnAlerts: 'true',
          returnCategory: 'true',
        }),
      ])

      const totalRecords = context.responseHeaders['total-records']

      const locationOptions =
        locations && locations.map((option) => ({ value: option.locationPrefix, text: option.description }))

      const results =
        prisoners &&
        prisoners.map((prisoner) => ({
          ...prisoner,
          assignedLivingUnitDesc: formatLocation(prisoner.assignedLivingUnitDesc),
          name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
          alerts: alertFlagLabels.filter((alertFlag) =>
            alertFlag.alertCodes.some(
              (alert) =>
                prisoner.alertsDetails && prisoner.alertsDetails.includes(alert) && profileAlertCodes.includes(alert)
            )
          ),
        }))

      const searchQueries = { ...req.query, ...(alerts ? { 'alerts[]': alerts } : {}) }

      if (results?.length > 0) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 5.
        trackEvent(telemetry, results, searchQueries, username, activeCaseLoad)
      }

      return res.render('prisonerSearch/prisonerSearch.njk', {
        alertOptions: alertFlagLabels
          .filter(({ alertCodes }) => profileAlertCodes.includes(...alertCodes))
          .map(({ alertCodes, label }) => ({
            value: alertCodes,
            text: label,
            checked: Boolean(selectedAlerts) && selectedAlerts.some((alert) => alertCodes.includes(alert)),
          })),
        formValues: { ...req.query, alerts: hasLength(alerts) && alerts.filter((alert) => alert.length) },
        links: {
          allResults: `${req.baseUrl}?${qs.stringify({
            ...searchQueries,
            viewAll: true,
            pageLimitOption: totalRecords,
          })}`,
          gridView: `${req.baseUrl}?${qs.stringify({ ...searchQueries, view: 'grid' })}`,
          listView: `${req.baseUrl}?${qs.stringify({ ...searchQueries, view: 'list' })}`,
        },
        locationOptions,
        pageLimit,
        pagination: paginationService.getPagination(totalRecords, pageOffset, pageLimit, fullUrl),
        printedValues: {
          location: locationOptions.find((loc) => loc.value === req.query.location),
          alerts: alertFlagLabels
            .filter(
              ({ alertCodes }) =>
                Boolean(selectedAlerts) &&
                selectedAlerts.find((alert) => alertCodes.includes(alert) && profileAlertCodes.includes(alert))
            )
            .map(({ label }) => label),
        },
        results,
        totalRecords,
        view,
      })
    } catch (error) {
      if (error && error.code !== 'ECONNRESET' && !(error.stack && error.stack.toLowerCase().includes('timeout')))
        logError(req.originalUrl, error, serviceUnavailableMessage)

      res.status(500)

      return res.render('error.njk', { url: '/' })
    }
  }

  const post = (req, res) => {
    const { alerts, ...queries } = req.query

    return res.redirect(
      `${req.baseUrl}?${qs.stringify({
        ...queries,
        ...(alerts ? { 'alerts[]': alerts } : {}),
        sortFieldsWithOrder: req.body.sortFieldsWithOrder,
      })}`
    )
  }

  return {
    index,
    post,
  }
}
