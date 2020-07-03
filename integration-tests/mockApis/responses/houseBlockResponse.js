const courtEvent1 = require('./courtEvent1')
const courtEvent2 = require('./courtEvent2')
const courtEvent3 = require('./courtEvent3')
const externalTransfer1 = require('./externalTransfer1')
const externalTransfer2 = require('./externalTransfer2')
const externalTransfer3 = require('./externalTransfer3')
const externalTransfer4 = require('./externalTransfer4')

const startTime = new Date().toISOString()
externalTransfer1.startTime = startTime
externalTransfer2.startTime = startTime
externalTransfer3.startTime = startTime
externalTransfer4.startTime = startTime

module.exports = {
  courtEventsWithDifferentStatusResponse: [courtEvent1, courtEvent2, courtEvent3],
  externalTransfersResponse: [externalTransfer1, externalTransfer2, externalTransfer3, externalTransfer4],
}
