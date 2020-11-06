const moment = require('moment')
const log = require('../log')
const { isPrisonerIdentifier, putLastNameFirst } = require('../utils')
const dobValidation = require('../shared/dobValidation')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

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
        log.info(`In globalSearch, searchText=${searchText}`)

        const dateOfBirthFilter = dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined
        const text = searchText
          .replace(/,/g, ' ')
          .replace(/\s\s+/g, ' ')
          .trim()

        const searchData = await (isPrisonerIdentifier(text)
          ? searchByOffender(context, text, genderFilter, locationFilter, dateOfBirthFilter, pageLimit)
          : searchByName(context, text, genderFilter, locationFilter, dateOfBirthFilter, pageLimit))

        log.info(searchData.length, 'globalSearch data received')

        results = searchData.map(offender => {
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

      const totalRecords = context.responseHeaders?.['total-records'] || 0

      return res.render('globalSearch/globalSearchResults.njk', {
        dpsUrl,
        errors,
        formValues: {
          searchText,
          filters,
        },
        openFilters: Boolean(Object.values(filters).filter(value => value && value !== 'ALL').length),
        pagination: paginationService.getPagination(
          totalRecords,
          pageOffset,
          pageLimit,
          new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
        ),
        results,
      })
    } catch (error) {
      if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

      return res.render('error.njk', { url: '/global-search' })
    }
  }

  return { indexPage, resultsPage }
}

module.exports = {
  globalSearchFactory,
}
