const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const axios = require('axios');
const applicationVersion = require('../application-version');

const packageData = applicationVersion.packageData;
const buildVersion = applicationVersion.buildNumber;

const serviceUris = [
  elite2Api.eliteApiUrl
];

const getHealth = (uri) => axios.get(`${uri}health`, { timeout: 2000 });

const reflect = (promise) => promise.then(
  response => ({ data: response.data, status: response.status }),
  error => {
    if (error.response) {
      return { data: error.response.data, status: error.response.status };
    }
    return { data: error.message, status: 500 };
  }
);

const healthResult = async () => {
  let status;

  const appInfo = {
    name: packageData.name,
    version: buildVersion,
    description: packageData.description,
    uptime: process.uptime()
  };

  try {
    const results = await Promise.all(serviceUris.map(getHealth).map(reflect));

    appInfo.api = {
      elite2Api: results[0].data
    };

    status = results.reduce((status, health) => Math.max(status, health.status), 200);
  } catch (error) {
    appInfo.api = error.message;
    status = (error.response && error.response.status) || 500;
  }
  return { appInfo, status };
};

router.get('/', asyncMiddleware(async (req, res, next) => {
  const response = await healthResult();
  res.status(response.status);
  res.json(response.appInfo);
}));

module.exports = {
  router,
  healthResult
};
