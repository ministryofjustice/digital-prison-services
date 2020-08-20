const moment = require('moment')

const { serviceUnavailableMessage } = require('../../common-messages')
const alertFlagValues = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const cellMoveAlertCodes = [
  'PEEP',
  'XTACT',
  'RTP',
  'RLG',
  'RCON',
  'XHT',
  'XGANG',
  'XR',
  'XA',
  'XEL',
  'CSIP',
  'URCU',
  'UPIU',
  'USU',
  'URS',
]

module.exports = ({ elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { location, attribute } = req.query

  // TODO: This is just a placeholder controller, actual functionality coming
  // in a separate ticket.
  res.send(`Select a cell for ${offenderNo} with location ${location} and attribute ${attribute}`)
}
