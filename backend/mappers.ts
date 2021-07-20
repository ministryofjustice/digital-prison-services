// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'pascalToSt... Remove this comment to see the full error message
const { pascalToString } = require('./utils')

const warning = 'Incentive Level warning'

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'absentReas... Remove this comment to see the full error message
const absentReasonMapper = (absenceReasons) => (absentReason) => {
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'stripWarni... Remove this comment to see the full error message
const stripWarning = (reason) =>
  (reason &&
    reason.toUpperCase().indexOf(warning.toUpperCase()) > 0 &&
    ` ${reason.replace(warning.toLowerCase(), '').trim()}`.trimStart()) ||
  reason

module.exports = {
  absentReasonMapper,
  warning,
  stripWarning,
}
