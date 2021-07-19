// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'nunjucks'.
const nunjucks = require('nunjucks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('../config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getDate'.
const { getDate, getTime, pascalToString, capitalize, hyphenatedStringToCamel, possessive } = require('../utils')

module.exports = (app) => {
  const njkEnv = nunjucks.configure(
    [path.join(__dirname, '../../views'), 'node_modules/govuk-frontend/', 'node_modules/@ministryofjustice/frontend/'],
    {
      autoescape: true,
      express: app,
      noCache: !config.app.production,
    }
  )

  njkEnv.addFilter('findError', (array, formFieldId) => {
    if (!array) return null
    const item = array.find((error) => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  njkEnv.addFilter('findErrors', (errors, formFieldIds) => {
    if (!errors) return null
    const fieldIds = formFieldIds.map((field) => `#${field}`)
    const errorIds = errors.map((error) => error.href)
    const firstPresentFieldError = fieldIds.find((fieldId) => errorIds.includes(fieldId))
    if (firstPresentFieldError) {
      return { text: errors.find((error) => error.href === firstPresentFieldError).text }
    }
    return null
  })

  njkEnv.addFilter('formatDate', (value, format) => (value ? moment(value).format(format) : null))

  njkEnv.addFilter('hasErrorWithPrefix', (errorsArray, prefixes) => {
    if (!errorsArray) return null
    const formattedPrefixes = prefixes.map((field) => `#${field}`)
    return errorsArray.some((error) => formattedPrefixes.some((prefix) => error.href.startsWith(prefix)))
  })

  njkEnv.addFilter('toTextValue', (array, selected) => {
    if (!array) return null

    const items = array.map((entry) => ({
      text: entry,
      value: entry,
      selected: entry && entry === selected,
    }))

    return [
      {
        text: '--',
        value: '',
        hidden: true,
        selected: true,
      },
      ...items,
    ]
  })

  njkEnv.addFilter('addDefaultSelectedVale', (items, text, show) => {
    if (!items) return null
    const attributes = {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'hidden' does not exist on type '{}'.
    if (!show) attributes.hidden = ''

    return [
      {
        text,
        value: '',
        selected: true,
        attributes,
      },
      ...items,
    ]
  })

  njkEnv.addFilter(
    'setSelected',
    (items, selected) =>
      items &&
      items.map((entry) => ({
        ...entry,
        selected: entry && entry.value === selected,
      }))
  )

  njkEnv.addFilter('toSummaryViewModel', (model) =>
    Object.keys(model)
      .filter((key) => model[key])
      .map((key) => ({
        key: { text: capitalize(pascalToString(key)) },
        value: { text: model[key], classes: `qa-${hyphenatedStringToCamel(key)}-value` },
      }))
  )

  njkEnv.addFilter(
    'removePaddingBottom',
    (items) =>
      items &&
      items.map((entry) => ({
        key: {
          ...entry.key,
          classes: `${entry.key.classes} govuk-!-padding-bottom-0`,
        },
        value: {
          ...entry.value,
          classes: `${entry.value.classes} govuk-!-padding-bottom-0`,
        },
      }))
  )

  njkEnv.addFilter(
    'longLabel',
    (items) =>
      items &&
      items.map((entry) => ({
        key: {
          ...entry.key,
          classes: `${entry.key.classes} govuk-!-width-one-half`,
        },
        value: {
          ...entry.value,
          classes: `${entry.value.classes} govuk-!-width-one-half`,
        },
      }))
  )

  njkEnv.addFilter('showDefault', (value, specifiedText) => {
    if (value === 0) return value

    return value || specifiedText || '--'
  })

  njkEnv.addFilter('getDate', getDate)
  njkEnv.addFilter('getTime', getTime)
  njkEnv.addFilter('truthy', (data) => Boolean(data))
  njkEnv.addFilter('possessive', possessive)
  njkEnv.addGlobal('googleTagManagerId', config.analytics.googleTagManagerId)
  njkEnv.addGlobal('supportUrl', config.app.supportUrl)

  return njkEnv
}
