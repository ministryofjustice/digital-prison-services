// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sortByDate... Remove this comment to see the full error message
const { sortByDateTime } = require('../../../utils')

module.exports = ({ personalCareNeeds, reasonableAdjustments, treatmentTypes, healthTypes, agencies }) => {
  const healthTypeCodes = healthTypes.map((healthType) => healthType.code)

  return {
    personalCareNeeds:
      personalCareNeeds &&
      personalCareNeeds
        .filter(
          (careNeed) =>
            careNeed.problemStatus === 'ON' &&
            healthTypeCodes.includes(careNeed.problemType) &&
            careNeed.problemCode !== 'NR'
        )
        .sort((left, right) => sortByDateTime(left.startDate, right.startDate))
        .map((careNeed) => ({
          type: healthTypes.find((healthType) => healthType.code === careNeed.problemType).description,
          description: careNeed.problemDescription,
          details: [
            { label: 'Description', value: careNeed.commentText },
            { label: 'From', value: careNeed.startDate && moment(careNeed.startDate).format('DD MMMM YYYY') },
            { label: 'Status', value: 'Ongoing' },
          ],
        })),
    reasonableAdjustments:
      reasonableAdjustments &&
      reasonableAdjustments
        .sort((left, right) => sortByDateTime(left.startDate, right.startDate))
        .map((adjustment) => {
          const agencyDetails = agencies.find((agency) => agency.agencyId === adjustment.agencyId)

          return {
            type: treatmentTypes.find((treatment) => treatment.code === adjustment.treatmentCode).description,
            details: [
              {
                label: 'Establishment',
                value: agencyDetails && (agencyDetails.formattedDescription || agencyDetails.description),
              },
              {
                label: 'Date provided',
                value: adjustment.startDate && moment(adjustment.startDate).format('DD MMMM YYYY'),
              },
              ...(adjustment.commentText ? [{ label: 'Comment', value: adjustment.commentText }] : []),
            ],
          }
        }),
  }
}
