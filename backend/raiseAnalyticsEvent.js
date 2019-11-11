const ua = require('universal-analytics')
const config = require('./config')

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
