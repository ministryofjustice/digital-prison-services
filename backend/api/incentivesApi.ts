import type { Response } from 'superagent'
import type { ClientContext, OauthApiClient } from './oauthEnabledClient'
import contextProperties from '../contextProperties'

export type PrisonIncentiveLevel = {
  levelCode: string
  levelName: string
  active: boolean
  defaultOnAdmission: boolean
  // NB: there are other properties, but they’re not relevant to DPS
}

export type IepSummaryForBooking = {
  bookingId: number
  iepLevel: string
  iepDate: string
  iepTime: string
  daysSinceReview: number
  nextReviewDate: string
}

export type IepSummaryDetail = {
  bookingId: number
  iepLevel: string
  iepDate: string
  iepTime: string
  comments: string
  agencyId: string
  userId: string | null
  // also available
  // auditModuleName: string
}

export type IepSummaryForBookingWithDetails = IepSummaryForBooking & {
  iepDetails: IepSummaryDetail[]
}

export type IepSummaryForBookingId = {
  bookingId: number
  iepLevel: string
}

export type IepLevelChangeRequest = {
  iepLevel: string
  comment: string
}

export type IepLevelChanged = {
  bookingId: number
  iepDate: string
  iepTime: string
  iepLevel: string
  comments: string
  // also available
  // id: number
  // prisonerNumber: string
  // agencyId: string
  // locationId: string
  // userId: string
  // reviewType: string
  // auditModuleName: string
}

export const incentivesApiFactory = (client: OauthApiClient) => {
  const processResponse =
    <T>(context: ClientContext) =>
    (response: Response): T => {
      contextProperties.setResponsePagination(context, response.headers)
      return response.body
    }

  const get = <T>(context: ClientContext, url: string): Promise<T> =>
    client.get<T>(context, url).then(processResponse(context))

  const post = <T, Body>(context: ClientContext, url: string, data: Body): Promise<T> =>
    client.post<T>(context, url, data).then(processResponse(context))

  const getPrisonIncentiveLevels = (context: ClientContext, agencyId: string): Promise<PrisonIncentiveLevel[]> =>
    get<PrisonIncentiveLevel[]>(context, `/incentive/prison-levels/${agencyId}`)

  type GetIepSummaryForBooking = {
    (context: ClientContext, bookingId: number, withDetails?: false): Promise<IepSummaryForBooking>
    (context: ClientContext, bookingId: number, withDetails: true): Promise<IepSummaryForBookingWithDetails>
  }
  const getIepSummaryForBooking: GetIepSummaryForBooking = (
    context: ClientContext,
    bookingId: number,
    withDetails = false
  ): Promise<any> => get(context, `/incentive-reviews/booking/${bookingId}?with-details=${withDetails}`)

  const getIepSummaryForBookingIds = (
    context: ClientContext,
    bookingIds: number[]
  ): Promise<IepSummaryForBookingId[]> =>
    post<IepSummaryForBookingId[], number[]>(context, '/incentive-reviews/bookings', bookingIds)

  const changeIepLevel = (context: ClientContext, bookingId: number, body: IepLevelChangeRequest) =>
    post<IepLevelChanged, IepLevelChangeRequest>(context, `/incentive-reviews/booking/${bookingId}`, body)

  return {
    getPrisonIncentiveLevels,
    getIepSummaryForBooking,
    getIepSummaryForBookingIds,
    changeIepLevel,
  }
}

export default { incentivesApiFactory }
