export const warning = 'Incentive Level warning'

export const stripWarning = (reason: string) =>
  (reason &&
    reason.toUpperCase().indexOf(warning.toUpperCase()) > 0 &&
    ` ${reason.replace(warning.toLowerCase(), '').trim()}`.trimStart()) ||
  reason

export default {
  warning,
  stripWarning,
}
