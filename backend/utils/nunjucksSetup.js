const nunjucks = require('nunjucks')

module.exports = (app, path) => {
  const njkEnv = nunjucks.configure([path.join(__dirname, '../../views'), 'node_modules/govuk-frontend/'], {
    autoescape: true,
    express: app,
  })

  njkEnv.addFilter('findError', (array, formFieldId) => {
    const item = array.find(error => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })
}
