import { switchDateFormat } from '../../utils'
import { DATE_TIME_FORMAT_SPEC, buildDateTime } from '../../../common/dateHelpers'
import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'

export const bulkAppointmentsClashesFactory = (systemOauthClient, prisonApi) => {
  const renderTemplate = (req, res, pageData) => {
    const { appointmentDetails, prisonersWithClashes } = pageData

    res.render('bulkAppointmentsClashes.njk', { appointmentDetails, prisonersWithClashes })
  }
  const getOtherEvents = async (req, res, { offenderNumbers, agencyId, date }) => {
    const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
    const searchCriteria = { agencyId, date, offenderNumbers }

    return Promise.all([
      prisonApi.getVisits(systemContext, searchCriteria),
      prisonApi.getAppointments(systemContext, searchCriteria),
      prisonApi.getExternalTransfers(systemContext, searchCriteria),
      prisonApi.getCourtEvents(systemContext, searchCriteria),
    ]).then((events) => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))
  }

  const index = async (req, res) => {
    if (!req.session.data) {
      return res.redirect('/bulk-appointments/add-appointment-details')
    }

    try {
      const {
        data: { date, prisonersListed },
      } = req.session

      const eventsByOffenderNo = await getOtherEvents(req, res, {
        offenderNumbers: prisonersListed.map((prisoner) => prisoner.offenderNo),
        date: switchDateFormat(date),
        agencyId: req.session.userDetails.activeCaseLoadId,
      }).then((events) =>
        events.reduce(
          (offenders, event) => ({
            ...offenders,
            [event.offenderNo]: (offenders[event.offenderNo] || []).concat(event),
          }),
          {}
        )
      )

      return renderTemplate(req, res, {
        appointmentDetails: { ...req.session.data },
        prisonersWithClashes: prisonersListed
          .map(
            (prisoner) =>
              eventsByOffenderNo[prisoner.offenderNo] && {
                ...prisoner,
                clashes: eventsByOffenderNo[prisoner.offenderNo],
              }
          )
          .filter((prisoner) => prisoner),
      })
    } catch (error) {
      res.locals.redirectUrl = '/bulk-appointments/need-to-upload-file'
      throw error
    }
  }

  const post = async (req, res) => {
    const {
      data: {
        appointmentType,
        appointmentTypeDescription,
        location,
        locationDescription,
        startTime,
        endTime,
        date,
        prisonersListed,
        comments,
        recurring,
        repeats,
        times,
      },
      userDetails: { activeCaseLoadId },
    } = req.session

    const [prisonersRemoved, remainingPrisoners] = prisonersListed.reduce(
      (prisonersSeparated, prisoner) => {
        prisonersSeparated[req.body[prisoner.offenderNo] ? 0 : 1].push(prisoner)
        return prisonersSeparated
      },
      [[], []]
    )

    if (prisonersRemoved && prisonersRemoved.length) {
      req.flash('prisonersRemoved', prisonersRemoved)
    }

    if (!remainingPrisoners.length) {
      return res.redirect('/bulk-appointments/no-appointments-added?reason=removedAllClashes')
    }

    req.session.appointmentSlipsData = {
      appointmentDetails: {
        startTime,
        endTime,
        comments,
        appointmentTypeDescription,
        locationDescription,
      },
      prisonersListed: remainingPrisoners,
    }

    const count = Number(times)
    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(location),
        appointmentType,
        startTime: startTime || (buildDateTime({ date, hours: 23, minutes: 59 }) as any).format(DATE_TIME_FORMAT_SPEC),
        endTime,
      },
      appointments: remainingPrisoners.map((prisoner) => ({
        bookingId: prisoner.bookingId,
        startTime: prisoner.startTime,
        endTime: prisoner.endTime,
      })),
      repeat:
        recurring === 'yes'
          ? {
              repeatPeriod: repeats,
              count,
            }
          : undefined,
    }

    await prisonApi.addAppointments(res.locals, request)

    req.session.data = null

    raiseAnalyticsEvent(
      'Bulk Appointments',
      `Appointments created at ${activeCaseLoadId}`,
      `Appointment type - ${appointmentTypeDescription}`,
      remainingPrisoners.length * (count || 1)
    )

    return res.redirect('/bulk-appointments/appointments-added')
  }

  return { index, post, getOtherEvents }
}

export default {
  bulkAppointmentsClashesFactory,
}
