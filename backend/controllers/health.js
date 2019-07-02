const axios = require('axios')
const asyncMiddleware = require('../middleware/asyncHandler')
const applicationVersion = require('../application-version')

const { packageData, buildNumber } = applicationVersion

const healthFactory = elite2ApiUrl => {
  const serviceUris = [elite2ApiUrl]

  const getHealth = uri => axios.get(`${uri}ping`, { timeout: 2000 })

  const reflect = promise =>
    promise.then(
      response => ({
        data: response.data,
        status: response.status,
      }),
      error => {
        if (error.response) {
          return {
            data: error.response.data,
            status: error.response.status,
          }
        }
        return {
          data: error.message,
          status: 500,
        }
      }
    )

  const healthResult = async () => {
    let status

    const appInfo = {
      name: packageData.name,
      version: buildNumber,
      description: packageData.description,
      uptime: process.uptime(),
      status: 'UP',
    }

    try {
      const results = await Promise.all(serviceUris.map(getHealth).map(reflect))

      appInfo.api = {
        elite2Api: results[0].data,
      }

      status = 200
    } catch (error) {
      appInfo.api = error.message
      status = 200
    }
    return {
      appInfo,
      status,
    }
  }

  const health = asyncMiddleware(async (req, res) => {
    const response = await healthResult()
    res.status(response.status)
    res.json(response.appInfo)
  })

  return {
    health,
  }
}

module.exports = {
  healthFactory,
}
