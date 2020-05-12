const moment = require('moment')
const { putLastNameFirst } = require('../../../utils')

module.exports = ({ aliases }) =>
  aliases &&
  aliases.map(alias => ({
    label: putLastNameFirst(alias.firstName, alias.lastName),
    value: alias.dob && moment(alias.dob).format('DD/MM/YYYY'),
  }))
