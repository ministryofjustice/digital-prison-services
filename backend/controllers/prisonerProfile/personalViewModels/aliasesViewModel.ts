import moment from 'moment'
import { putLastNameFirst } from '../../../utils'

export default ({ aliases }) =>
  aliases &&
  aliases.map((alias) => ({
    label: putLastNameFirst(alias.firstName, alias.lastName),
    value: alias.dob && moment(alias.dob).format('DD/MM/YYYY'),
  }))
