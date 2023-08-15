import { formatTimestampToDate, formatTimestampToDateTime, putLastNameFirst, sortByDateTime } from '../../utils'
import getContext from './prisonerProfileContext'

export default ({ prisonApi, oauthApi, systemOauthClient, restrictedPatientApi, adjudicationsApi }) =>
  async (req, res) => {
    const { offenderNo, adjudicationNumber } = req.params

    const { context } = await getContext({
      offenderNo,
      res,
      req,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi,
    })

    try {
      const [prisonerDetails, adjudicationDetails] = await Promise.all([
        prisonApi.getDetails(context, offenderNo),
        adjudicationsApi.getAdjudicationDetails(context, offenderNo, adjudicationNumber),
      ])

      const { firstName, lastName } = prisonerDetails
      const { incidentTime, reportTime, hearings, reporterFirstName, reporterLastName } = adjudicationDetails

      return res.render('prisonerProfile/prisonerAdjudicationDetails.njk', {
        adjudicationDetails: {
          ...adjudicationDetails,
          hearings: hearings
            ?.sort((left, right) => sortByDateTime(right.hearingTime, left.hearingTime))
            .map((hearing) => {
              const { hearingTime, heardByFirstName, heardByLastName, results } = hearing
              const comments = []

              return {
                ...hearing,
                comments,
                heardBy: putLastNameFirst(heardByFirstName, heardByLastName),
                hearingTime: hearingTime && formatTimestampToDateTime(hearingTime, 'DD MMMM YYYY - HH:mm'),
                results: results.map((result) => ({
                  ...result,
                  sanctions: result.sanctions.map((sanction) => {
                    const { comment, effectiveDate, statusDate } = sanction
                    if (comment) comments.push(comment)

                    return {
                      ...sanction,
                      effectiveDate: effectiveDate && formatTimestampToDate(effectiveDate),
                      statusDate: statusDate && formatTimestampToDate(statusDate),
                    }
                  }),
                })),
              }
            }),
          incidentTime: incidentTime && formatTimestampToDateTime(incidentTime),
          reportTime: reportTime && formatTimestampToDateTime(reportTime),
          reportedBy: putLastNameFirst(reporterFirstName, reporterLastName),
        },
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}`,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
