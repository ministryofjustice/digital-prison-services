const { pascalToString } = require('./utils')

const absentReasonMapper = absenceReasons => absentReason => {
  const { triggersIEPWarning } = absenceReasons

  const absentReasonMap = {
    AcceptableAbsence: 'Acceptable',
    UnacceptableAbsence: 'Unacceptable',
  }

  const enhanceWithIepIfRequired = (key, value) => (triggersIEPWarning.includes(key) ? `${value} - IEP` : value)
  return (
    absentReason && {
      value: absentReason,
      name: enhanceWithIepIfRequired(absentReason, absentReasonMap[absentReason] || pascalToString(absentReason)),
    }
  )
}

module.exports = {
  absentReasonMapper,
}
