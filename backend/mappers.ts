import { pascalToString } from './utils'

export const warning = 'Incentive Level warning'

export const absentReasonMapper = (absenceReasons) => (absentReason) => {
  const { triggersIEPWarning } = absenceReasons

  const absentReasonMap = {
    AcceptableAbsence: 'Acceptable',
    UnacceptableAbsence: 'Unacceptable',
  }

  const enhanceWithIepIfRequired = (key, value) =>
    triggersIEPWarning.includes(key)
      ? ` ${value.replace(warning.toLowerCase(), '').trim()} - ${warning}`.trimStart()
      : value

  return (
    absentReason && {
      value: absentReason,
      name: enhanceWithIepIfRequired(absentReason, absentReasonMap[absentReason] || pascalToString(absentReason)),
    }
  )
}

export const stripWarning = (reason) =>
  (reason &&
    reason.toUpperCase().indexOf(warning.toUpperCase()) > 0 &&
    ` ${reason.replace(warning.toLowerCase(), '').trim()}`.trimStart()) ||
  reason

export default {
  absentReasonMapper,
  warning,
  stripWarning,
}
