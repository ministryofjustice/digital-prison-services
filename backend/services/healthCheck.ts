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
  communityUrl,
  keyworkerUrl,
  caseNotesUrl,
  allocationManagerUrl,
  tokenverificationUrl,
  offenderSearchUrl,
  complexityUrl,
  incentivesApiUrl
) {
  const checks = [
    service('auth', authUrl),
    service('hmppsManageUsers', manageUsersApiUrl),
    service('prisonApi', prisonApiUrl),
    service('community', communityUrl),
    service('allocationManager', allocationManagerUrl),
    service('casenotes', caseNotesUrl),
    service('tokenverification', tokenverificationUrl),
    service('offenderSearch', offenderSearchUrl),
    service('complexity', complexityUrl),
    service('incentivesApi', incentivesApiUrl),
  ]

  if (!config.app.whereaboutsMaintenanceMode) {
    checks.push(service('whereabouts', whereaboutsUrl))
  }

  if (!config.app.keyworkerMaintenanceMode) {
    checks.push(service('keyworker', keyworkerUrl))
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
