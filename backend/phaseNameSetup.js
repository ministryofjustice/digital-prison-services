/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["app"] }] */

const preprodText = 'This test version of DPS contains real data which may be up to two weeks old.'

module.exports = (app, config) => {
  app.locals.phaseName = config.phaseName
  app.locals.phaseNameColour = config.phaseName === 'PRE_PRODUCTION' ? 'phase-banner-green' : 'phase-banner-blue'
  app.locals.phaseNameText = config.phaseName === 'PRE_PRODUCTION' ? preprodText : ''
}
