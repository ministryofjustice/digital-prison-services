const ua = require('universal-analytics')
const config = require('./config')

const raiseAnalyticsEvent = (category, action, label) => {
  if (!config.analytics.googleAnalyticsId) return Promise.resolve()
  const ga = ua(config.analytics.googleAnalyticsId)
  const data = {
    ec: category,
    ea: action,
    el: label,
  }
  const res = ga.event(data).send()
  return res
}

module.exports = {
  raiseAnalyticsEvent,
}
