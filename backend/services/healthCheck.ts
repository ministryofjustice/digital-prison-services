import path from 'path'
import fs from 'fs'
import { serviceCheckFactory } from '../controllers/healthCheck'
import config from '../config'

const service = (name, url) => {
  const check = serviceCheckFactory(name, url)

  return () =>
    check()
      .then((result) => ({ name, status: 'UP', message: result }))
      .catch((err) => ({ name, status: 'ERROR', message: err }))
}

const gatherCheckInfo = (total, currentValue) => ({ ...total, [currentValue.name]: currentValue.message })

const getBuild = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), './build-info.json'), 'utf-8'))
  } catch (ex) {
    return null
  }
}

const addAppInfo = (result) => {
  const buildInformation = getBuild()
  const buildInfo = {
    uptime: process.uptime(),
    build: buildInformation,
    version: buildInformation?.buildNumber || 'Not available',
  }

  return { ...result, ...buildInfo }
}

export default function healthcheckFactory(
  authUrl,
  manageUsersApiUrl,
  prisonApiUrl,
  whereaboutsUrl,
  deliusIntegrationUrl,
  caseNotesUrl,
  tokenverificationUrl,
  offenderSearchUrl,
  complexityUrl,
  bookAVideoLinkUrl,
  locationsInsidePrisonApiUrl,
  nomisMappingUrl
) {
  const checks = [
    service('auth', authUrl),
    service('hmppsManageUsers', manageUsersApiUrl),
    service('prisonApi', prisonApiUrl),
    service('delius', deliusIntegrationUrl),
    service('casenotes', caseNotesUrl),
    service('tokenverification', tokenverificationUrl),
    service('offenderSearch', offenderSearchUrl),
    service('complexity', complexityUrl),
    service('locationsInsidePrisonApi', locationsInsidePrisonApiUrl),
    service('nomisMapping', nomisMappingUrl),
    service('bookAVideoLinkApi', bookAVideoLinkUrl),
  ]

  if (!config.app.whereaboutsMaintenanceMode) {
    checks.push(service('whereabouts', whereaboutsUrl))
  }

  return (callback) =>
    Promise.all(checks.map((fn) => fn())).then((checkResults) => {
      const allOk = checkResults.every((item) => item.status === 'UP') ? 'UP' : 'DOWN'
      const result = {
        name: 'digital-prison-services',
        status: allOk,
        api: checkResults.reduce(gatherCheckInfo, {}),
      }
      callback(null, addAppInfo(result))
    })
}
