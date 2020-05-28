const moment = require('moment')
const { readableDateFormat } = require('../../../utils')
const getValueByType = require('../../../shared/getValueByType')

module.exports = sentenceDetails => {
  const conditionalRelease = sentenceDetails.conditionalReleaseOverrideDate || sentenceDetails.conditionalReleaseDate
  const postRecallDate = sentenceDetails.postRecallReleaseOverrideDate || sentenceDetails.postRecallReleaseDate
  const automaticReleaseDate = sentenceDetails.automaticReleaseOverrideDate || sentenceDetails.automaticReleaseDate
  const nonParoleDate = sentenceDetails.nonParoleDate || sentenceDetails.nonParoleOverrideDate

  return {
    currentExpectedReleaseDates: [
      ...(sentenceDetails.homeDetentionCurfewEligibilityDate
        ? [
            {
              label: 'Approved for home detention curfew',
              value: readableDateFormat(sentenceDetails.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.paroleEligibilityDate
        ? [
            {
              label: 'Approved for parole',
              value: readableDateFormat(sentenceDetails.paroleEligibilityDate, 'YYYY-MM-DD'),
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
    ],
    earlyAndTemporaryReleaseEligibilityDates: [
      ...(sentenceDetails.homeDetentionCurfewActualDate
        ? [
            {
              label: 'Home detention curfew',
              value: readableDateFormat(sentenceDetails.homeDetentionCurfewActualDate, 'YYYY-MM-DD'),
            },
          ]
        : []),
      ...(sentenceDetails.releaseOnTemporaryLicenceDate
        ? [
            {
              label: 'Release on temporary license',
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
      ...(sentenceDetails.actualParoleDate
        ? [
            {
              label: 'Parole',
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
    ],
    licenceDates: [
      ...(sentenceDetails.licenceExpiryDate
        ? [
            {
              label: 'Licence expiry date',
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
    ],
    otherReleaseDates: [
      ...(sentenceDetails.lateTermDate
        ? [
            {
              label: 'Late transfer',
              value: readableDateFormat(sentenceDetails.lateTermDatee, 'YYYY-MM-DD'),
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
    ],
  }
}
