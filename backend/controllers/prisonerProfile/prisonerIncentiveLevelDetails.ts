import moment from 'moment'
import type apis from '../../apis'
import type { IepSummaryDetail } from '../../api/incentivesApi'
import { putLastNameFirst, properCaseName, formatName, daysSince } from '../../utils'

type HistoryDetail = IepSummaryDetail & {
  iepEstablishment: string
  iepStaffMember: string | undefined
  formattedTime: string
}

type HistoryFilters = {
  agencyId?: string
  incentiveLevel?: string
  fromDate?: string
  toDate?: string
}

const filterData = (data: HistoryDetail[], fields: HistoryFilters): HistoryDetail[] => {
  let filteredResults = data
  if (fields.agencyId) {
    filteredResults = filteredResults.filter((result) => result.agencyId === fields.agencyId)
  }

  if (fields.incentiveLevel) {
    filteredResults = filteredResults.filter((result) => result.iepLevel === fields.incentiveLevel)
  }

  if (fields.fromDate) {
    const fromDate = moment(fields.fromDate)
    filteredResults = filteredResults.filter((result) => moment(result.iepDate).isSameOrAfter(fromDate))
  }

  if (fields.toDate) {
    const toDate = moment(fields.toDate)
    filteredResults = filteredResults.filter((result) => moment(result.iepDate).isSameOrBefore(toDate))
  }

  return filteredResults
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export default ({
    prisonApi,
    incentivesApi,
    oauthApi,
  }: {
    prisonApi: typeof apis.prisonApi
    incentivesApi: typeof apis.incentivesApi
    oauthApi: typeof apis.oauthApi
  }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const { agencyId, incentiveLevel, fromDate, toDate } = req.query

    const fromDateFormatted = moment(fromDate, 'DD/MM/YYYY')
    const toDateFormatted = moment(toDate, 'DD/MM/YYYY')

    try {
      const errors = []
      const [prisonerDetails, userRoles] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        oauthApi.userRoles(res.locals),
      ])
      const { bookingId, firstName, lastName } = prisonerDetails

      const prisonerWithinCaseloads = res.locals.user.allCaseloads.find(
        (cl) => cl.caseLoadId === prisonerDetails.agencyId
      )

      const userCanMaintainIEP = userRoles.find((role) => role.roleCode === 'MAINTAIN_IEP')

      let iepSummary
      try {
        iepSummary = await incentivesApi.getIepSummaryForBooking(res.locals, bookingId, true)
      } catch (error) {
        if (error.response.status === 404) {
          const noResultsFoundMessage = `${formatName(firstName, lastName)} has no incentive level history`

          return res.render('prisonerProfile/prisonerIncentiveLevelDetails.njk', {
            breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
            results: null,
            currentIepDate: 'Not entered',
            currentIepLevel: 'Not entered',
            errors,
            formValues: req.query,
            noResultsFoundMessage,
            nextReviewDate: 'Not entered',
            offenderNo,
            prisonerName: formatName(firstName, lastName),
            profileUrl: `/prisoner/${offenderNo}`,
            userCanUpdateIEP: Boolean(prisonerWithinCaseloads && userCanMaintainIEP),
          })
        }
      }

      if (fromDate && toDate && fromDateFormatted.isAfter(toDateFormatted, 'day')) {
        errors.push({ href: '#fromDate', text: 'Enter a from date which is not after the to date' })
        errors.push({ href: '#toDate', text: 'Enter a to date which is not before the from date' })
      }

      // Offenders are likely to have multiple IEPs at the same agency.
      // By getting a unique list of users and agencies, we reduce the duplicate
      // calls to the database.
      const uniqueUserIds = Array.from(new Set(iepSummary.iepDetails.map((details) => details.userId)))
      const uniqueAgencyIds = Array.from(new Set(iepSummary.iepDetails.map((details) => details.agencyId)))

      // Only get users that map to a user in the prison staff table
      const users = (
        await Promise.all(
          uniqueUserIds
            .filter((userId) => Boolean(userId))
            .map((userId) => prisonApi.getStaffDetails(res.locals, userId))
        )
      ).filter(notEmpty)

      const establishments = await Promise.all(
        uniqueAgencyIds.filter((id) => Boolean(id)).map((id) => prisonApi.getAgencyDetails(res.locals, id))
      )

      const iepHistoryDetails: HistoryDetail[] = iepSummary.iepDetails.map((details) => {
        const { description } = establishments.find((estb) => estb.agencyId === details.agencyId)
        const user = details.userId && users.find((u) => u.username === details.userId)

        return {
          iepEstablishment: description,
          iepStaffMember: user && `${properCaseName(user.firstName)} ${properCaseName(user.lastName)}`,
          formattedTime: moment(details.iepTime, 'YYYY-MM-DD HH:mm').format('D MMMM YYYY - HH:mm'),
          ...details,
        }
      })

      const nextReviewDate = moment(iepSummary.nextReviewDate, 'YYYY-MM-DD HH:mm')
      const reviewDaysOverdue = daysSince(nextReviewDate)

      const filteredResults = filterData(iepHistoryDetails, {
        agencyId,
        incentiveLevel,
        fromDate: fromDate && fromDateFormatted.format('YYYY-MM-DD'),
        toDate: toDate && toDateFormatted.format('YYYY-MM-DD'),
      })

      const noFiltersSupplied = Boolean(!agencyId && !incentiveLevel && !fromDate && !toDate)

      const noResultsFoundMessage =
        (!filteredResults.length &&
          (noFiltersSupplied
            ? `${formatName(firstName, lastName)} has no incentive level history`
            : 'There is no incentive level history for the selections you have made')) ||
        ''

      const levels = Array.from(new Set(iepSummary.iepDetails.map((details) => details.iepLevel))).sort()

      return res.render('prisonerProfile/prisonerIncentiveLevelDetails.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        currentIepDate: moment(iepSummary.iepDate).format('D MMMM YYYY'),
        currentIepLevel: iepSummary.iepLevel,
        errors,
        formValues: req.query,
        noResultsFoundMessage,
        establishments: establishments
          .sort((a, b) => a.description.localeCompare(b.description))
          .map((establishment) => ({
            text: establishment.description,
            value: establishment.agencyId,
          })),
        levels: levels.map((level) => ({
          text: level,
          value: level,
        })),
        nextReviewDate: nextReviewDate.format('D MMMM YYYY'),
        reviewDaysOverdue,
        offenderNo,
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}`,
        results: filteredResults,
        userCanUpdateIEP: Boolean(prisonerWithinCaseloads && userCanMaintainIEP),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
