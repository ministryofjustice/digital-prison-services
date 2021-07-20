// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst } = require('../../../utils')

module.exports = ({ aliases }) =>
  aliases &&
  aliases.map((alias) => ({
    label: putLastNameFirst(alias.firstName, alias.lastName),
    value: alias.dob && moment(alias.dob).format('DD/MM/YYYY'),
  }))
