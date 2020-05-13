const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ prisonerProfileService, referenceCodesService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { fromDate, toDate, alertType, pageOffsetOption } = req.query
  const fomattedFromDate = fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const fomattedToDate = toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const pageLimit = 20
  const pageOffset = pageOffsetOption || 0

  try {
    const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

    const alertTypeQuery = type => (type ? `alertType:in:'${type}'` : '')
    const fromQuery = date => (date ? `dateCreated:gteq:DATE'${date}'` : '')
    const toQuery = date => (date ? `dateCreated:lteq:DATE'${date}'` : '')

    const queryParts = [alertTypeQuery(alertType), fromQuery(fomattedFromDate), toQuery(fomattedToDate)]
      .filter(value => value)
      .join(',and:')

    const query = queryParts ? `?query=${queryParts}` : ''

    const headers = {
      'Sort-Order': 'DESC',
      'Sort-Fields': 'dateCreated',
      'Page-Offset': pageOffset,
      'Page-Limit': pageLimit,
    }

    const [prisonerProfileData, alerts, alertTypes] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getAlertsForBooking(res.locals, { bookingId, query }, headers),
      referenceCodesService.getAlertTypes(res.locals),
    ])

    const totalAlerts = prisonerProfileData.activeAlertCount + prisonerProfileData.inactiveAlertCount

    const numberOfPages =
      totalAlerts % pageLimit > 0 ? Math.floor(totalAlerts / pageLimit) + 1 : Math.floor(totalAlerts / pageLimit)
    const pageList =
      numberOfPages > 0
        ? [...Array(numberOfPages).keys()].map(page => {
            return {
              text: page + 1,
              href: `?pageOffsetOption=${pageLimit * page}`,
              selected: pageOffset === pageLimit * page,
            }
          })
        : []

    const previousPage =
      numberOfPages > 0
        ? { text: 'Previous', href: `?pageOffsetOption=${pageOffset > 0 ? pageOffset - pageLimit : 0}` }
        : undefined
    const nextPage =
      numberOfPages > 0
        ? {
            text: 'Next',
            href: `?pageOffsetOption=${pageOffset < totalAlerts ? pageOffset - pageLimit : pageOffset + pageLimit}`,
          }
        : undefined

    const pagination = {
      items: pageList,
      previous: previousPage,
      next: nextPage,
      results: {
        from: pageOffset + 1,
        to: numberOfPages > 0 ? pageOffset + pageLimit : totalAlerts,
        count: totalAlerts,
      },
      classes: 'govuk-!-font-size-19',
    }

    const activeAlerts = alerts.filter(alert => alert.active && !alert.expired).map(alert => {
      return [
        { text: alert.alertTypeDescription },
        { text: alert.alertCodeDescription },
        { text: alert.comment || 'None' },
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
        { text: alert.alertTypeDescription },
        { text: alert.alertCodeDescription },
        { text: alert.comment || 'None' },
        {
          html: `${moment(alert.dateCreated, 'YYYY-MM-DD').format('DD/MM/YYYY')}<br>${moment(
            alert.dateExpires,
            'YYYY-MM-DD'
          ).format('DD/MM/YYYY')}`,
        },
        {
          html: `${putLastNameFirst(alert.addedByFirstName, alert.addedByLastName)}<br>${putLastNameFirst(
            alert.expiredByFirstName,
            alert.expiredByLastName
          )}`,
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
      activeAlerts,
      inactiveAlerts,
      alertTypeValues,
      pagination,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/alerts` })
  }
}
