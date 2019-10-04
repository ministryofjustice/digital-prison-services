const { switchDateFormat } = require('../utils')

const bulkAppointmentsClashesFactory = (elite2Api, logError) => {
  const renderTemplate = (req, res, pageData) => {
    const { appointmentDetails, prisonersWithClashes } = pageData

    res.render('appointmentsClashes.njk', { appointmentDetails, prisonersWithClashes })
  }

  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  const getOtherEvents = (req, res, { offenderNumbers, agencyId, date }) => {
    const searchCriteria = { agencyId, date, offenderNumbers }

    return Promise.all([
      elite2Api.getVisits(res.locals, searchCriteria),
      elite2Api.getAppointments(res.locals, searchCriteria),
      elite2Api.getExternalTransfers(res.locals, searchCriteria),
      elite2Api.getCourtEvents(res.locals, searchCriteria),
    ])
      .then(events => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))
      .catch(error => renderError(req, res, error))
  }

  const index = async (req, res) => {
    const { data } = req.session

    if (!data) return renderError(req, res)

    const {
      data: { date, prisonersListed },
    } = req.session

    const eventsForAllOffenders = await getOtherEvents(req, res, {
      offenderNumbers: prisonersListed.map(prisoner => prisoner.offenderNo),
      date: switchDateFormat(date),
      agencyId: req.session.userDetails.activeCaseLoadId,
    })

    const eventsGroupedByOffenderNo = eventsForAllOffenders.reduce(
      (offenders, event) =>
        Object.assign(offenders, { [event.offenderNo]: (offenders[event.offenderNo] || []).concat(event) }),
      {}
    )

    const prisonersWithClashes = prisonersListed.map(prisoner => {
      if (eventsGroupedByOffenderNo[prisoner.offenderNo]) {
        return {
          ...prisoner,
          clashes: eventsGroupedByOffenderNo[prisoner.offenderNo],
        }
      }
      return null
    })

    return renderTemplate(req, res, {
      appointmentDetails: {
        ...req.session.data,
      },
      prisonersWithClashes,
    })
  }

  const post = async (req, res) => {
    const {
      data: {
        appointmentType,
        location,
        startTime,
        endTime,
        // date,
        prisonersListed,
        comments,
        recurring,
        repeats,
        times,
      },
    } = req.session

    // To be used on final success page
    // const removedPrisoners = prisonersListed.filter(prisoner => req.body[prisoner.offenderNo])

    const remainingPrisoners = prisonersListed.filter(prisoner => !req.body[prisoner.offenderNo])

    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(location),
        appointmentType,
        startTime, // || buildDateTime({ date, hours: 23, minutes: 59 }).format(DATE_TIME_FORMAT_SPEC),
        endTime,
      },
      appointments: remainingPrisoners.map(prisoner => ({
        bookingId: prisoner.bookingId,
        // startTime: prisoner.startTime,
        // endTime: prisoner.endTime,
      })),
      repeat:
        recurring === 'yes'
          ? {
              repeatPeriod: repeats,
              count: Number(times),
            }
          : undefined,
    }

    await elite2Api.addBulkAppointments(res.locals, request)

    return res.redirect('/bulk-appointments/appointments-added')
  }

  return { index, post, getOtherEvents }
}

module.exports = {
  bulkAppointmentsClashesFactory,
}
