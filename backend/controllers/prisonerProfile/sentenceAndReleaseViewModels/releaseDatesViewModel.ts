// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'readableDa... Remove this comment to see the full error message
const { readableDateFormat } = require('../../../utils')

module.exports = (sentenceDetails) => {
  const conditionalRelease = sentenceDetails.conditionalReleaseOverrideDate || sentenceDetails.conditionalReleaseDate
  const postRecallDate = sentenceDetails.postRecallReleaseOverrideDate || sentenceDetails.postRecallReleaseDate
  const automaticReleaseDate = sentenceDetails.automaticReleaseOverrideDate || sentenceDetails.automaticReleaseDate
  const nonParoleDate = sentenceDetails.nonParoleOverrideDate || sentenceDetails.nonParoleDate
  const detentionTrainingOrderPostRecallDate =
    sentenceDetails.dtoPostRecallReleaseDateOverride || sentenceDetails.dtoPostRecallReleaseDate

  const sortByEarliestDate = (left, right) => {
    const leftDate = moment(left.value, 'D MMMM YYYY')
    const rightDate = moment(right.value, 'D MMMM YYYY')

    return leftDate.diff(rightDate)
  }

  return {
    currentExpectedReleaseDates: [
      ...(sentenceDetails.homeDetentionCurfewActualDate
        ? [
            {
              label: 'Approved for home detention curfew',
              value: readableDateFormat(sentenceDetails.homeDetentionCurfewActualDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(conditionalRelease
        ? [
            {
              label: 'Conditional release',
              value: readableDateFormat(conditionalRelease, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(postRecallDate
        ? [
            {
              label: 'Post recall release',
              value: readableDateFormat(postRecallDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.midTermDate
        ? [
            {
              label: 'Mid transfer',
              value: readableDateFormat(sentenceDetails.midTermDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(automaticReleaseDate
        ? [
            {
              label: 'Automatic release',
              value: readableDateFormat(automaticReleaseDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(nonParoleDate
        ? [
            {
              label: 'Non parole',
              value: readableDateFormat(nonParoleDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(detentionTrainingOrderPostRecallDate
        ? [
            {
              label: 'Detention training post recall',
              value: readableDateFormat(detentionTrainingOrderPostRecallDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
    ].sort(sortByEarliestDate),
    earlyAndTemporaryReleaseEligibilityDates: [
      ...(sentenceDetails.paroleEligibilityDate
        ? [
            {
              label: 'Parole eligibility',
              value: readableDateFormat(sentenceDetails.paroleEligibilityDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.homeDetentionCurfewEligibilityDate
        ? [
            {
              label: 'Home detention curfew',
              value: readableDateFormat(sentenceDetails.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.releaseOnTemporaryLicenceDate
        ? [
            {
              label: 'Release on temporary licence',
              value: readableDateFormat(sentenceDetails.releaseOnTemporaryLicenceDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.earlyRemovalSchemeEligibilityDate
        ? [
            {
              label: 'Early removal scheme',
              value: readableDateFormat(sentenceDetails.earlyRemovalSchemeEligibilityDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate
        ? [
            {
              label: 'Tariff early removal scheme',
              value: readableDateFormat(sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.actualParoleDate
        ? [
            {
              label: 'Approved for parole',
              value: readableDateFormat(sentenceDetails.actualParoleDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.earlyTermDate
        ? [
            {
              label: 'Early transfer',
              value: readableDateFormat(sentenceDetails.earlyTermDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
    ].sort(sortByEarliestDate),
    licenceDates: [
      ...(sentenceDetails.licenceExpiryDate
        ? [
            {
              label: 'Licence expiry',
              value: readableDateFormat(sentenceDetails.licenceExpiryDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.sentenceExpiryDate
        ? [
            {
              label: 'Sentence expiry',
              value: readableDateFormat(sentenceDetails.sentenceExpiryDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.topupSupervisionExpiryDate
        ? [
            {
              label: 'Top up supervision expiry',
              value: readableDateFormat(sentenceDetails.topupSupervisionExpiryDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
    ].sort(sortByEarliestDate),
    otherReleaseDates: [
      ...(sentenceDetails.lateTermDate
        ? [
            {
              label: 'Late transfer',
              value: readableDateFormat(sentenceDetails.lateTermDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.tariffDate
        ? [
            {
              label: 'Tariff',
              value: readableDateFormat(sentenceDetails.tariffDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
    ].sort(sortByEarliestDate),
  }
}
