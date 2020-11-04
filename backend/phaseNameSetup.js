/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["app"] }] */

module.exports = (app, config) => {
  app.locals.phaseName = config.phaseName
  app.locals.phaseNameColour = config.phaseName === 'PRE_PRODUCTION' ? 'phase-banner-green' : 'phase-banner-blue'
}
