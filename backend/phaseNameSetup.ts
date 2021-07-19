/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["app"] }] */

const preprodText = 'This test version of DPS contains real data which may be up to 2 weeks old.'

module.exports = (app, config) => {
  app.locals.phaseName = config.phaseName
  app.locals.phaseNameColour = config.phaseName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals.phaseNameText = config.phaseName === 'PRE-PRODUCTION' ? preprodText : ''
}
