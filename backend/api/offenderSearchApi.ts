import moment from 'moment'
import contextProperties from '../contextProperties'
import { mapToQueryString } from '../utils'
import { BasicAlert } from "@ministryofjustice/hmpps-connect-dps-shared-items";

export type PrisonerSearchResult = {
  firstName: string
  lastName: string
  bookingId: number
  prisonerNumber: string
  cellLocation: string
  status: string
  alerts: Array<BasicAlert>
  category: string
  currentIncentive?: {
    level: {
      description: string
    }
  }
  currentFacialImageId: number
}

// other fields are present but only these are used
export type PrisonerInPrisonSearchResult = PrisonerSearchResult & {
  assignedLivingUnitDesc: string
  alertsDetails: string[]
  age: number
  categoryCode: string
  offenderNo: string
}

export const offenderSearchApiFactory = (client) => {
  const processResponse = (context) => (response) => {
    contextProperties.setPaginationFromPageRequest(context, response.body)
    return response.body.content
  }

  const changeFieldNames = () => (data) =>
    data.map(
      ({
        prisonerNumber,
        bookingId,
        firstName,
        lastName,
        dateOfBirth,
        prisonId,
        locationDescription,
        status,
        currentFacialImageId,
      }) => ({
        offenderNo: prisonerNumber,
        firstName,
        lastName,
        dateOfBirth,
        latestBookingId: Number(bookingId),
        latestLocationId: prisonId,
        latestLocation: locationDescription,
        currentlyInPrison: status && status.startsWith('ACTIVE') ? 'Y' : 'N',
        currentWorkingFirstName: firstName,
        currentWorkingLastName: lastName,
        currentFacialImageId,
      })
    )

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))
  const get = (context, url) => client.get(context, url).then(processResponse(context))

  const globalSearch = (context, params, pageSizeOverride) => {
    const { page, size } = contextProperties.getPaginationForPageRequest(context)
    const pageSize = pageSizeOverride || size
    return post(context, `/global-search?${mapToQueryString({ page, size: pageSize })}`, params).then(
      changeFieldNames()
    )
  }

  const establishmentSearch = async (context, locationId, params): Promise<Array<PrisonerInPrisonSearchResult>> => {
    const { page, size, sort } = contextProperties.getPaginationForPageRequest(context, (fieldName: string) => {
      switch (fieldName) {
        case 'assignedLivingUnitDesc':
          return 'cellLocation'
        default:
          return fieldName
      }
    })
    const results = await get(
      context,
      `/prison/${locationId}/prisoners?${mapToQueryString({ ...params, page, size, sort })}`
    )
    return results.map((prisoner) => ({
      ...prisoner,
      // for backward compatibility - treat bookingId as a number
      bookingId: Number(prisoner.bookingId),
      offenderNo: prisoner.prisonerNumber,
      alertsDetails: prisoner.alerts.map((alert: { alertCode: string }) => alert.alertCode),
      assignedLivingUnitDesc: prisoner.cellLocation,
      age: moment().diff(prisoner.dateOfBirth, 'years'),
      categoryCode: prisoner.category,
    }))
  }

  const getPrisonersDetails = async (context, prisonerNumbers: Array<string>): Promise<Array<PrisonerSearchResult>> => {
    const res = await client.post(context, '/prisoner-search/prisoner-numbers', { prisonerNumbers })
    return res.body
  }

  return {
    globalSearch,
    establishmentSearch,
    getPrisonersDetails,
  }
}

export default { offenderSearchApiFactory }
