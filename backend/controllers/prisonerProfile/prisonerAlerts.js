const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst } = require('../../utils')

const getPagination = (totalResults, offset, limit, url) => {
  const numberOfPages =
    totalResults % limit > 0 ? Math.floor(totalResults / limit) + 1 : Math.floor(totalResults / limit)

  const calculateNextUrl = () => {
    const newOffset = offset + limit > totalResults ? offset : offset + limit
    url.searchParams.set('pageOffsetOption', newOffset)
    return url.href
  }

  const calculatePreviousUrl = () => {
    const newOffset = offset > 0 ? offset - limit : 0
    url.searchParams.set('pageOffsetOption', newOffset)
    return url.href
  }

  const pageList =
    numberOfPages > 1
      ? [...Array(numberOfPages).keys()].map(page => {
          url.searchParams.set('pageOffsetOption', limit * page)
          return {
            text: page + 1,
            href: url.href,
            selected: offset === limit * page,
          }
        })
      : []

  const previousPage =
    numberOfPages > 1
      ? {
          text: 'Previous',
          href: calculatePreviousUrl(offset, limit, url),
        }
      : undefined
  const nextPage =
    numberOfPages > 1
      ? {
          text: 'Next',
          href: calculateNextUrl(offset, limit, url, totalResults, numberOfPages),
        }
      : undefined

  return {
    items: pageList,
    previous: previousPage,
    next: nextPage,
    results: {
      from: offset + 1,
      to: numberOfPages > 1 && offset + limit < totalResults ? offset + limit : totalResults,
      count: totalResults,
    },
    classes: 'govuk-!-font-size-19',
  }
}

module.exports = ({ prisonerProfileService, referenceCodesService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { fromDate, toDate, alertType, active, pageOffsetOption } = req.query
  const fomattedFromDate = fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const fomattedToDate = toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const pageLimit = 20
  const pageOffset = parseInt(pageOffsetOption, 10) || 0
  const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

  try {
    const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

    const alertTypeQuery = type => (type ? `alertType:in:'${type}'` : '')
    const fromQuery = date => (date ? `dateCreated:gteq:DATE'${date}'` : '')
    const toQuery = date => (date ? `dateCreated:lteq:DATE'${date}'` : '')
    const activeQuery = activeFlag => (activeFlag ? `active:eq:'${activeFlag}'` : "active:eq:'ACTIVE'")

    const queryParts = [
      alertTypeQuery(alertType),
      fromQuery(fomattedFromDate),
      toQuery(fomattedToDate),
      activeQuery(active),
    ]
      .filter(value => value)
      .join(',and:')

    const query = queryParts ? `?query=${queryParts}` : ''

    const headers = {
      'Sort-Order': 'DESC',
      'Sort-Fields': 'dateCreated',
      'Page-Offset': pageOffset,
      'Page-Limit': pageLimit,
    }

    const [prisonerProfileData, alertTypes, alerts] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      referenceCodesService.getAlertTypes(res.locals),
      elite2Api.getAlertsForBooking(res.locals, { bookingId, query }, headers),
    ])

    const totalAlerts =
      active === 'INACTIVE' ? prisonerProfileData.inactiveAlertCount : prisonerProfileData.activeAlertCount

    const activeAlerts = alerts.filter(alert => alert.active && !alert.expired).map(alert => {
      return [
        { text: alert.alertTypeDescription, classes: 'active-alert govuk-!-font-weight-bold' },
        { text: alert.alertCodeDescription },
        { text: alert.comment || 'None', classes: 'clip-overflow' },
        { text: moment(alert.dateCreated, 'YYYY-MM-DD').format('DD/MM/YYYY') },
        { text: `${putLastNameFirst(alert.addedByFirstName, alert.addedByLastName)}` },
        {
          html: `<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=${offenderNo}&alertId=${
            alert.alertId
          }">Edit or close</a>`,
        },
      ]
    })
    const inactiveAlerts = alerts.filter(alert => !alert.active && alert.expired).map(alert => {
      return [
        { text: alert.alertTypeDescription, classes: 'inactive-alert govuk-!-font-weight-bold' },
        { text: alert.alertCodeDescription, classes: 'inactive-alert' },
        { text: alert.comment || 'None', classes: 'inactive-alert clip-overflow' },
        {
          html: `${moment(alert.dateCreated, 'YYYY-MM-DD').format('DD/MM/YYYY')}<br>${moment(
            alert.dateExpires,
            'YYYY-MM-DD'
          ).format('DD/MM/YYYY')}`,
          classes: 'inactive-alert',
        },
        {
          html: `${putLastNameFirst(alert.addedByFirstName, alert.addedByLastName)}<br>${putLastNameFirst(
            alert.expiredByFirstName,
            alert.expiredByLastName
          )}`,
          classes: 'inactive-alert',
        },
      ]
    })

    const alertTypeValues =
      (alertTypes &&
        alertTypes.alertTypes &&
        alertTypes.alertTypes
          .filter(type => type.activeFlag === 'Y')
          .map(type => ({ value: type.value, text: type.description }))
          .sort((a, b) => a.description - b.description)) ||
      []

    return res.render('prisonerProfile/prisonerAlerts.njk', {
      prisonerProfileData,
      totalAlerts,
      alertType,
      fromDate,
      toDate,
      active,
      activeAlerts,
      inactiveAlerts,
      alertTypeValues,
      pagination: getPagination(totalAlerts, pageOffset, pageLimit, fullUrl),
      createLink: `/offenders/${offenderNo}/create-alert`,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/alerts` })
  }
}
