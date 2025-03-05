import moment from 'moment'
import { Response } from 'express'
import { formatName, getCurrentPeriod, getTime, properCaseName } from '../../utils'
import { offenderSearchApiFactory, PrisonerSearchResult } from '../../api/offenderSearchApi'
import config from '../../config'
import SystemOauthClient from '../../api/systemOauthClient'
import { prisonApiFactory } from '../../api/prisonApi'
import { bookAVideoLinkApiFactory } from '../../api/bookAVideoLinkApi'
import { nomisMappingClientFactory } from '../../api/nomisMappingClient'
import { locationsInsidePrisonApiFactory, NonResidentialUsageType } from '../../api/locationsInsidePrisonApi'
import { whereaboutsApiFactory } from '../../api/whereaboutsApi'
import { mapLocationApiResponse } from '../../services/appointmentsService'

export const getAgencyGroupLocationPrefix = async (
  systemContext: Awaited<ReturnType<typeof SystemOauthClient.getClientCredentialsTokens>>,
  locationsInsidePrisonApi: ReturnType<typeof locationsInsidePrisonApiFactory>,
  locationKey: string,
  userCaseLoad: string
): Promise<string> => {
  const fullLocationPrefix = await locationsInsidePrisonApi.getAgencyGroupLocationPrefix(
    systemContext,
    userCaseLoad,
    locationKey
  )

  if (fullLocationPrefix) {
    const locationIdWithSuffix = fullLocationPrefix.locationPrefix
    return locationIdWithSuffix?.length < 1 ? '' : locationIdWithSuffix.slice(0, -1)
  }
  return `${userCaseLoad}-${locationKey}`
}

async function getCellLocationsFromPrisonerSearch(offenderSearchApi, systemContext, appointmentsOfType) {
  // don't need to call Prisoner Search if no appointments
  if (appointmentsOfType.length === 0) return new Map()

  const prisonerDetailsForOffenderNumbers: Array<PrisonerSearchResult> = await offenderSearchApi.getPrisonersDetails(
    systemContext,
    Array.from(new Set(appointmentsOfType.map((appointment) => appointment.offenderNo)))
  )
  return new Map(prisonerDetailsForOffenderNumbers.map((i) => [i.prisonerNumber, i.cellLocation]))
}

export default ({
    systemOauthClient,
    prisonApi,
    offenderSearchApi,
    whereaboutsApi,
    locationsInsidePrisonApi,
    bookAVideoLinkApi,
    nomisMapping,
  }: {
    systemOauthClient: typeof SystemOauthClient
    prisonApi: ReturnType<typeof prisonApiFactory>
    offenderSearchApi: ReturnType<typeof offenderSearchApiFactory>
    whereaboutsApi: ReturnType<typeof whereaboutsApiFactory>
    locationsInsidePrisonApi: ReturnType<typeof locationsInsidePrisonApiFactory>
    bookAVideoLinkApi: ReturnType<typeof bookAVideoLinkApiFactory>
    nomisMapping: ReturnType<typeof nomisMappingClientFactory>
  }) =>
  async (req, res: Response): Promise<void> => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const { date, timeSlot = getCurrentPeriod(), type, locationId, residentialLocation } = req.query
    const searchDate = date ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
    const agencyId = req.session.userDetails.activeCaseLoadId
    const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)

    const offenderLocationPrefix = residentialLocation
      ? await getAgencyGroupLocationPrefix(systemContext, locationsInsidePrisonApi, residentialLocation, agencyId)
      : agencyId

    const [appointmentTypes, appointmentLocations, appointments, residentialLocations] = await Promise.all([
      prisonApi.getAppointmentTypes(res.locals),
      locationsInsidePrisonApi.getLocations(agencyId, NonResidentialUsageType.APPOINTMENT),
      whereaboutsApi.getAppointments(systemContext, agencyId, {
        date: searchDate,
        timeSlot: timeSlot !== 'All' ? timeSlot : undefined,
        locationId,
        offenderLocationPrefix,
      }),
      locationsInsidePrisonApi.getSearchGroups(systemContext, agencyId),
    ])

    const videoLinkAppointments = await bookAVideoLinkApi.getPrisonSchedule(systemContext, agencyId, searchDate)

    const locationMappings = await Promise.all(
      [...new Set(videoLinkAppointments.map((vlb) => vlb.dpsLocationId))].map((id) =>
        nomisMapping.getNomisLocationMappingByDpsLocationId(systemContext, id)
      )
    )

    const vlbAppointmentMappings = videoLinkAppointments
      .map((vlb) => {
        const appointment = appointments.find(
          (app) =>
            vlb.startTime === moment(app.startTime).format('HH:mm') &&
            vlb.endTime === moment(app.endTime).format('HH:mm') &&
            vlb.prisonerNumber === app.offenderNo &&
            vlb.dpsLocationId === locationMappings.find((m) => m.nomisLocationId === app.locationId)?.dpsLocationId &&
            config.app.bvlsMasteredAppointmentTypes.includes(app.appointmentTypeCode)
        )

        return appointment
          ? {
              appointmentId: appointment.id,
              videoLinkBooking: vlb,
            }
          : undefined
      })
      .filter(Boolean)

    const videoLinkCourtMappings = vlbAppointmentMappings.map((map) => ({
      appointmentId: map.appointmentId,
      court: map.videoLinkBooking.courtDescription || map.videoLinkBooking.probationTeamDescription,
    }))

    const appointmentsOfType = appointments.filter((appointment) =>
      type ? appointment.appointmentTypeCode === type : true
    )
    const cellLocationMap = await getCellLocationsFromPrisonerSearch(
      offenderSearchApi,
      systemContext,
      appointmentsOfType
    )

    const appointmentsEnhanced = appointmentsOfType.map(async (appointment) => {
      const { startTime, endTime, offenderNo } = appointment
      const offenderName = `${properCaseName(appointment.lastName)}, ${properCaseName(appointment.firstName)}`
      const offenderUrl = `/prisoner/${offenderNo}`

      const getCourtDescription = () => {
        const courtMapping = videoLinkCourtMappings.find((mapping) => mapping.appointmentId === appointment.id)

        return (
          (courtMapping && `${appointment.locationDescription}</br>with: ${courtMapping.court}`) ||
          appointment.locationDescription
        )
      }

      const videoLinkAppointment =
        config.app.bvlsMasteredAppointmentTypes.includes(appointment.appointmentTypeCode) &&
        videoLinkAppointments.find((videoLinkAppt) => videoLinkAppt.appointmentId === appointment.id)

      return [
        {
          text: endTime ? `${getTime(startTime)} to ${getTime(endTime)}` : getTime(startTime),
        },
        {
          html: `<a href="${offenderUrl}" class="govuk-link">${offenderName} - ${offenderNo}</a>`,
          attributes: {
            'data-sort-value': appointment.lastName,
          },
        },
        {
          text: cellLocationMap.get(offenderNo),
        },
        {
          text: appointment.appointmentTypeDescription,
        },
        {
          html: getCourtDescription(),
        },
        {
          html: `<a href="/appointment-details/${
            videoLinkAppointment?.mainAppointmentId || appointment.id
          }" class="govuk-link" aria-label="View details of ${formatName(
            appointment.firstName,
            appointment.lastName
          )}'s appointment">View details </a>`,
          classes: 'govuk-!-display-none-print',
        },
      ]
    })

    const appointmentRows = await Promise.all(appointmentsEnhanced)

    const types = appointmentTypes.map((appointmentType) => ({
      text: appointmentType.description,
      value: appointmentType.code,
    }))

    const locations = appointmentLocations.map(mapLocationApiResponse).map((appointmentLocation) => ({
      text: appointmentLocation.userDescription,
      value: appointmentLocation.locationId,
    }))

    return res.render('viewAppointments.njk', {
      types,
      locations,
      timeSlot,
      type,
      appointmentRows,
      locationId: locationId && Number(locationId),
      residentialLocation,
      residentialLocationOptions: residentialLocations.map((location) => ({
        text: location.name,
        value: location.key,
      })),
      date: moment(searchDate).format('DD/MM/YYYY'),
      formattedDate: moment(searchDate).format('D MMMM YYYY'),
    })
  }
