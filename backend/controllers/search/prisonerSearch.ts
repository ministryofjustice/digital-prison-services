import qs from 'querystring'
import { PrisonerInPrisonSearchResult } from '../../api/offenderSearchApi'
import { serviceUnavailableMessage } from '../../common-messages'
import { User } from '../../middleware/currentUser'
import { alertFlagLabels, profileAlertCodes } from '../../shared/alertFlagValues'
import { putLastNameFirst, hasLength, formatLocation, toMap } from '../../utils'
import { Location } from '../../api/prisonApi'
import { app } from '../../config'

export const trackEvent = (telemetry, results, searchQueries, username, activeCaseLoad) => {
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

type InmateSearchResult = Promise<[Location[], PrisonerInPrisonSearchResult[], number]>

interface LocalContext {
  user: User
}

export interface PagingContext {
  requestHeaders: {
    'page-offset'?: number
    'page-limit'?: number
    'sort-fields'?: string
    'sort-order'?: string
  }
  responseHeaders?: {
    'total-records'?: number
  }
}
interface InmateSearchParameters {
  localContext: LocalContext
  pagingContext: PagingContext
  keywords: string
  selectedAlerts: string[]
  location: string
  username: string
}

export default ({
  paginationService,
  prisonApi,
  offenderSearchApi,
  incentivesApi,
  telemetry,
  logError,
  systemOauthClient,
}) => {
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
      feature = app.establishmentSearchUsePrisonerSearch ? 'new' : 'legacy',
    } = req.query

    const selectedAlerts = alerts && alerts.map((alert) => alert.split(',')).flat()
    const pageLimit = (pageLimitOption && parseInt(pageLimitOption, 10)) || 50
    const pageOffset = (pageOffsetOption && !viewAll && parseInt(pageOffsetOption, 10)) || 0
    const [sortFields, sortOrder] = sortFieldsWithOrder.split(':')

    const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

    // ignore special "feature" flag
    const hasSearched = Boolean(Object.keys(req.query).filter((key) => key !== 'feature').length)

    if (hasSearched) req.session.prisonerSearchUrl = req.originalUrl

    try {
      const localContext = {
        ...res.locals,
      }
      const pagingContext: PagingContext = {
        requestHeaders: {
          'page-offset': pageOffset,
          'page-limit': pageLimit,
          'sort-fields': sortFields,
          'sort-order': sortOrder,
        },
      }

      const [locations, prisoners, totalRecords] = await getInmatesWithLocations({
        localContext,
        pagingContext,
        keywords,
        selectedAlerts,
        location: location || currentUserCaseLoad,
        feature,
        username,
      })

      const bookingIds = prisoners.map((prisoner) => prisoner.bookingId)
      const [iepData] = await Promise.all([incentivesApi.getIepSummaryForBookingIds(localContext, bookingIds)])
      const iepBookingIdMap = toMap('bookingId', iepData)

      const locationOptions =
        locations && locations.map((option) => ({ value: option.locationPrefix, text: option.description }))

      const results =
        prisoners &&
        prisoners.map((prisoner) => ({
          ...prisoner,
          iepLevel: iepBookingIdMap.get(prisoner.bookingId).iepLevel,
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
        trackEvent(telemetry, results, searchQueries, username, activeCaseLoad)
      }

      return res.render('prisonerSearch/prisonerSearch.njk', {
        alertOptions: alertFlagLabels
          // @ts-expect-error ts-migrate(2556) FIXME: Expected 1-2 arguments, but got 0 or more.
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

  const getInmatesWithLocations = async ({
    feature,
    ...params
  }: InmateSearchParameters & { feature: 'legacy' | 'new' }): InmateSearchResult => {
    return feature === 'legacy'
      ? getInmatesWithLocationsWithPrisonApi(params)
      : getInmatesWithLocationsWithSearchApi(params)
  }

  const getInmatesWithLocationsWithPrisonApi = async ({
    pagingContext,
    localContext,
    keywords,
    selectedAlerts,
    location,
  }: InmateSearchParameters): InmateSearchResult => {
    const searchContext = {
      ...localContext,
      ...pagingContext,
    }

    const [locations, prisoners] = await Promise.all([
      prisonApi.userLocations(localContext),
      prisonApi.getInmates(searchContext, location, {
        keywords,
        alerts: selectedAlerts,
        returnAlerts: 'true',
        returnCategory: 'true',
      }),
    ])

    const totalRecords = searchContext.responseHeaders['total-records']

    return [locations, prisoners, totalRecords]
  }

  const getInmatesWithLocationsWithSearchApi = async ({
    pagingContext,
    localContext,
    keywords,
    selectedAlerts,
    location,
    username,
  }: InmateSearchParameters): InmateSearchResult => {
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)
    const searchContext: PagingContext = {
      ...systemContext,
      ...pagingContext,
    }
    const { prisonId, internalLocation } = extractPrisonAndInternalLocation(location)

    // when the prison-api was used, searching for prisoners not in your caseload returned no results
    // rightly or wrongly this replicates that behaviour (maybe a 403 error eould have been better)
    const establishmentSearchForValidCaseload: () => Promise<PrisonerInPrisonSearchResult[]> = () =>
      isPrisonSearchAllowedForCaseloads(localContext, prisonId)
        ? offenderSearchApi.establishmentSearch(searchContext, prisonId, {
            term: keywords,
            alerts: selectedAlerts,
            cellLocationPrefix: internalLocation,
          })
        : Promise.resolve([])

    const [locations, prisoners] = await Promise.all([
      prisonApi.userLocations(localContext),
      establishmentSearchForValidCaseload(),
    ])

    const totalRecords = searchContext.responseHeaders?.['total-records'] ?? 0

    return [locations, prisoners, totalRecords]
  }

  const extractPrisonAndInternalLocation = (
    location: string
  ): { prisonId: string; internalLocation: string | undefined } => {
    // this might be an internal location so prisonId is always first 3 characters
    const prisonId = location.slice(0, 3)
    return { prisonId, internalLocation: prisonId === location ? undefined : location }
  }

  const isPrisonSearchAllowedForCaseloads = (localContext: LocalContext, prisonId: string): boolean => {
    const userCaseLoads = localContext.user.allCaseloads.map((caseload) => caseload.caseLoadId) ?? []

    // technically a caseload id and prison id are not the same, but there are no current caseload ids where this will not work
    return userCaseLoads.includes(prisonId)
  }

  return {
    index,
    post,
  }
}
