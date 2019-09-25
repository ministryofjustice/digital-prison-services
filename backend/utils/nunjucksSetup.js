const nunjucks = require('nunjucks')
const config = require('../config')
const { getDate, getTime } = require('../utils')

module.exports = (app, path) => {
  const njkEnv = nunjucks.configure([path.join(__dirname, '../../views'), 'node_modules/govuk-frontend/'], {
    autoescape: true,
    express: app,
  })

  njkEnv.addFilter('findError', (array, formFieldId) => {
    if (!array) return null
    const item = array.find(error => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  njkEnv.addFilter('toTextValue', (array, selected) => {
    if (!array) return null

    const items = array.map(entry => ({
      text: entry,
      value: entry,
      selected: entry && entry === selected,
    }))

    return [
      {
        text: '--',
        value: '',
        disabled: true,
        hidden: true,
        selected: true,
      },
      ...items,
    ]
  })

  njkEnv.addFilter('addDefaultSelectedVale', (items, text) => {
    if (!items) return null

    return [
      {
        text,
        value: '',
        disabled: true,
        hidden: true,
        selected: true,
      },
      ...items,
    ]
  })

  njkEnv.addFilter('getDate', getDate)
  njkEnv.addFilter('getTime', getTime)
  njkEnv.addFilter('truthy', data => Boolean(data))
  njkEnv.addGlobal('notmUrl', config.app.notmEndpointUrl)
}
