const superagent = require('superagent')
const config = require('./config')

const raiseAnalyticsEvent = (category, action, label, value) => {
  if (!config.analytics.googleAnalyticsId) return Promise.resolve()

  const data = {
    tid: config.analytics.googleAnalyticsId,
    t: 'event',
    ec: category,
    ea: action,
    el: label,
    ev: value,
  }
  return superagent.post('http://www.google-analytics.com/collect', data)
}

module.exports = {
  raiseAnalyticsEvent,
}
