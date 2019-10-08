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
    ]).then(events => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))
  }

  const index = async (req, res) => {
    if (!req.session.data) return renderError(req, res)

    try {
      const {
        data: { date, prisonersListed },
      } = req.session

      const eventsByOffenderNo = await getOtherEvents(req, res, {
        offenderNumbers: prisonersListed.map(prisoner => prisoner.offenderNo),
        date: switchDateFormat(date),
        agencyId: req.session.userDetails.activeCaseLoadId,
      }).then(events =>
        events.reduce(
          (offenders, event) =>
            Object.assign(offenders, { [event.offenderNo]: (offenders[event.offenderNo] || []).concat(event) }),
          {}
        )
      )

      return renderTemplate(req, res, {
        appointmentDetails: { ...req.session.data },
        prisonersWithClashes: prisonersListed
          .map(
            prisoner =>
              eventsByOffenderNo[prisoner.offenderNo] && {
                ...prisoner,
                clashes: eventsByOffenderNo[prisoner.offenderNo],
              }
          )
          .filter(prisoner => prisoner),
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const post = async (req, res) => {
    const {
      data: { appointmentType, location, startTime, endTime, prisonersListed, comments, recurring, repeats, times },
    } = req.session

    const remainingPrisoners = prisonersListed.filter(prisoner => !req.body[prisoner.offenderNo])

    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(location),
        appointmentType,
        startTime,
        endTime,
      },
      appointments: remainingPrisoners.map(prisoner => ({ bookingId: prisoner.bookingId })),
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
