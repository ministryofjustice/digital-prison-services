const ua = require('universal-analytics')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'raiseAnaly... Remove this comment to see the full error message
const raiseAnalyticsEvent = (category, action, label, value) => {
  if (!config.analytics.googleAnalyticsId) return Promise.resolve()
  const ga = ua(config.analytics.googleAnalyticsId)
  const data = {
    ec: category,
    ea: action,
    el: label,
    ev: value,
  }
  return ga.event(data).send()
}

module.exports = {
  raiseAnalyticsEvent,
}
