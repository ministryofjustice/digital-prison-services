// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'log'.
const log = require('../log')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isPrisoner... Remove this comment to see the full error message
const { isPrisonerIdentifier, putLastNameFirst } = require('../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'dobValidat... Remove this comment to see the full error message
const dobValidation = require('../shared/dobValidation')
const {
  app: { licencesUrl },
} = require('../config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'trackEvent... Remove this comment to see the full error message
const trackEvent = (telemetry, prisonerResults, searchText, filters, username, activeCaseLoad) => {
  if (telemetry) {
    const offenderNos = prisonerResults?.map((prisonerResult) => prisonerResult.offenderNo)
    const openFilterValues = Object.fromEntries(
      Object.entries(filters).filter((entry) => entry[1] && entry[1] !== 'ALL')
    )

    telemetry.trackEvent({
      name: `GlobalSearch`,
      properties: {
        offenderNos,
        searchText,
        filters: openFilterValues,
        username,
        caseLoadId: activeCaseLoad?.caseLoadId,
      },
    })
  }
}

module.exports = ({ paginationService, offenderSearchApi, oauthApi, telemetry }) => {
  const searchByOffender = (context, offenderNo, gender, location, dateOfBirth, pageLimit) =>
    offenderSearchApi.globalSearch(
      context,
      {
        prisonerIdentifier: offenderNo.toUpperCase(),
        gender,
        location,
        dateOfBirth,
        includeAliases: true,
      },
      pageLimit
    )

  const searchByName = (context, name, gender, location, dateOfBirth, pageLimit) => {
    const [lastName, firstName] = name.split(' ')
    return offenderSearchApi.globalSearch(
      context,
      {
        lastName,
        firstName,
        gender,
        location,
        dateOfBirth,
        includeAliases: true,
      },
      pageLimit
    )
  }

  const backWhiteList = { licences: licencesUrl }

  const indexPage = (req, res) => {
    const { referrer } = req.query
    return res.render('globalSearch/globalSearch.njk', { backLink: backWhiteList[referrer], referrer })
  }
  const prisonerBooked = (prisoner) => prisoner.latestBookingId > 0
  const resultsPage = async (req, res) => {
    let prisonerResults = []
    const {
      user: { activeCaseLoad },
    } = res.locals
    const { username } = req.session.userDetails

    const { searchText, pageLimitOption, pageOffsetOption, referrer, ...filters } = req.query
    const { genderFilter, locationFilter, dobDay, dobMonth, dobYear } = filters
    const pageLimit = (pageLimitOption && parseInt(pageLimitOption, 10)) || 20
    const pageOffset = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0

    const { dobErrors, dobIsValid, dateOfBirth } = dobValidation(dobDay, dobMonth, dobYear)
    const errors = [...dobErrors]

    const context = {
      ...res.locals,
      requestHeaders: {
        'page-offset': pageOffset,
        'page-limit': pageLimit,
      },
    }

    if (searchText && !errors.length) {
      log.info(`In globalSearch, searchText=${searchText}`)

      const dateOfBirthFilter = dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined
      const text = searchText.replace(/,/g, ' ').replace(/\s\s+/g, ' ').trim()

      const searchData = await (isPrisonerIdentifier(text)
        ? searchByOffender(context, text, genderFilter, locationFilter, dateOfBirthFilter, pageLimit)
        : searchByName(context, text, genderFilter, locationFilter, dateOfBirthFilter, pageLimit))

      log.info(searchData.length, 'globalSearch data received')

      prisonerResults = searchData.map((offender) => {
        const formattedDateOfBirth =
          offender.dateOfBirth && moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY')

        return {
          ...offender,
          dateOfBirth: formattedDateOfBirth,
          name: putLastNameFirst(offender.firstName, offender.lastName),
          workingName: putLastNameFirst(offender.currentWorkingFirstName, offender.currentWorkingLastName),
        }
      })
    }

    const userRoles = await oauthApi.userRoles(res.locals).then((roles) => roles.map((role) => role.roleCode))
    const isLicencesUser = userRoles.includes('LICENCE_RO')
    const isLicencesVaryUser = userRoles.includes('LICENCE_VARY')
    const userCanViewInactive = userRoles.includes('INACTIVE_BOOKINGS')

    if (prisonerResults?.length > 0) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 6.
      trackEvent(telemetry, prisonerResults, searchText, filters, username, activeCaseLoad)
    }

    return res.render('globalSearch/globalSearchResults.njk', {
      backLink: backWhiteList[referrer],
      errors,
      formValues: {
        searchText,
        filters,
      },
      isLicencesUser,
      openFilters: Boolean(Object.values(filters).filter((value) => value && value !== 'ALL').length),
      pagination: paginationService.getPagination(
        context.responseHeaders?.['total-records'] || 0,
        pageOffset,
        pageLimit,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
      referrer,
      results: prisonerResults.map((prisoner) => ({
        ...prisoner,
        showUpdateLicenceLink:
          isLicencesUser && (prisoner.currentlyInPrison === 'Y' || isLicencesVaryUser) && prisonerBooked(prisoner),
        showProfileLink:
          ((userCanViewInactive && prisoner.currentlyInPrison === 'N') || prisoner.currentlyInPrison === 'Y') &&
          prisonerBooked(prisoner),
        updateLicenceLink: prisonerBooked(prisoner)
          ? `${licencesUrl}hdc/taskList/${prisoner.latestBookingId}`
          : undefined,
      })),
    })
  }

  return { indexPage, resultsPage }
}
