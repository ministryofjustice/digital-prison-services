const moment = require('moment')

const { formatCurrency, readableDateFormat } = require('../../../utils')

const onlyValidValues = value => Boolean(value)

const mergeMostRecentLicenceTerm = sentences =>
  sentences.reduce((result, current) => {
    if (current.sentenceTermCode === 'IMP' && !result) return current
    if (current.sentenceTermCode === 'LIC' && !result.licence) {
      return {
        licence: {
          years: current.years,
          months: current.months,
          days: current.days,
        },
        ...result,
      }
    }

    return result
  }, null)

const groupSentencesBySequence = sentences =>
  sentences.reduce((result, current) => {
    const key = current.sentenceSequence
    const existing = result.find(sentence => sentence.key === key)

    if (existing) {
      return [{ ...existing, items: [...existing.items, current] }, ...result.filter(entry => entry.key !== key)]
    }
    return [{ key, caseId: current.caseId, items: [current] }, ...result]
  }, [])

const sortBySentenceDateThenByImprisonmentLength = (left, right) => {
  const startDateLeft = moment(left.startDate, 'YYYY-MM-DD')
  const startDateRight = moment(right.startDate, 'YYYY-MM-DD')

  if (startDateLeft.isAfter(startDateRight)) return 1
  if (startDateLeft.isBefore(startDateRight)) return -1

  if (left.years < right.years) return 1
  if (left.years > right.years) return -1

  if (left.months < right.months) return 1
  if (left.months > right.months) return -1

  return right.days - left.days
}

module.exports = ({ courtCaseData, sentenceTermsData, offenceHistory }) => {
  const caseIds = [
    ...new Set(offenceHistory.filter(offence => offence.primaryResultCode === '1002').map(offence => offence.caseId)),
  ]

  return courtCaseData
    .filter(courtCase => caseIds.includes(courtCase.id))
    .map(courtCase => ({
      caseInfoNumber: courtCase.caseInfoNumber,
      courtName: courtCase.agency && courtCase.agency.description,
      sentenceTerms: groupSentencesBySequence(sentenceTermsData)
        .filter(group => Number(group.caseId) === courtCase.id)
        .map(groupedSentence => mergeMostRecentLicenceTerm(groupedSentence.items))
        .sort(sortBySentenceDateThenByImprisonmentLength)
        .map(sentence => ({
          sentenceHeader: `Sentence ${sentence.sentenceSequence}`,
          sentenceTypeDescription: sentence.sentenceTypeDescription,
          summaryDetailRows: [
            { label: 'Start date', value: sentence.startDate && readableDateFormat(sentence.startDate, 'YYYY-MM-DD') },
            {
              label: 'Imprisonment',
              value: `${sentence.years || 0} years, ${sentence.months || 0} months, ${sentence.days || 0} days`,
            },
            sentence.consecutiveTo && { label: 'Consecutive to', value: sentence.consecutiveTo },
            sentence.fineAmount && { label: 'Fine', value: formatCurrency(sentence.fineAmount) },
            sentence.licence && {
              label: 'License',
              value: `${sentence.licence.years || 0} years, ${sentence.licence.months || 0} months, ${sentence.licence
                .days || 0} days`,
            },
          ].filter(onlyValidValues),
        })),
      offences: [
        ...new Set(
          offenceHistory
            .filter(offence => offence.caseId === courtCase.id)
            .map(offence => offence.offenceDescription)
            .filter(onlyValidValues)
            .sort((left, right) => left.localeCompare(right))
        ),
      ],
    }))
    .filter(courtCase => courtCase.sentenceTerms.length)
    .map(courtCase => {
      const sentenceDateRow = courtCase.sentenceTerms[0].summaryDetailRows.find(st => st.label === 'Start date')

      return {
        ...courtCase,
        sentenceDate: sentenceDateRow && sentenceDateRow.value,
      }
    })
}
