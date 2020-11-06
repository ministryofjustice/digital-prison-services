const moment = require('moment')
const log = require('../log')
const { isPrisonerIdentifier, putLastNameFirst } = require('../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

const dobValidation = require('../shared/dobValidation')

const globalSearchFactory = ({ paginationService, offenderSearchApi, logError }) => {
  const searchByOffender = (context, offenderNo, gender, location, dateOfBirth, pageLimit) =>
    offenderSearchApi.globalSearch(
      context,
      {
        prisonerIdentifier: offenderNo,
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

  const globalSearch = async (context, searchText, gender, location, dateOfBirth, pageLimit) => {
    log.info(`In globalSearch, searchText=${searchText}`)
    if (!searchText) {
      return []
    }
    const text = searchText
      .replace(/,/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim()
    const data = await (isPrisonerIdentifier(text)
      ? searchByOffender(context, text, gender, location, dateOfBirth, pageLimit)
      : searchByName(context, text, gender, location, dateOfBirth, pageLimit))
    log.info(data.length, 'globalSearch data received')

    return data.map(offender => {
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

  const indexPage = (req, res) => res.render('globalSearch/globalSearch.njk', { dpsUrl })

  const resultsPage = async (req, res) => {
    let results = []
    const { searchText, pageLimitOption, pageOffsetOption, ...filters } = req.query
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

    try {
      if (searchText && !errors.length) {
        const dateOfBirthFilter = dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined

        results = await globalSearch(context, searchText, genderFilter, locationFilter, dateOfBirthFilter, pageLimit)
      }

      const totalRecords = context.responseHeaders?.['total-records'] || 0

      return res.render('globalSearch/globalSearchResults.njk', {
        dpsUrl,
        errors,
        formValues: {
          searchText,
          filters,
        },
        openFilters: Boolean(Object.values(filters).filter(value => value && value !== 'ALL').length),
        results,
        pagination: paginationService.getPagination(
          totalRecords,
          pageOffset,
          pageLimit,
          new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
        ),
      })
    } catch (error) {
      if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

      return res.render('error.njk', { url: '/global-search' })
    }
  }

  return { globalSearch, indexPage, resultsPage }
}

module.exports = {
  globalSearchFactory,
}
