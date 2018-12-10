import PropTypes from 'prop-types'
import moment from 'moment'

const HoursAndMinutes = ({ hhmmss }) => {
  if (!hhmmss) return ''
  const m = moment(hhmmss, 'HH:mm:ss')
  return m.format('HH:mm')
}

HoursAndMinutes.propTypes = {
  hhmmss: PropTypes.string,
}
export default HoursAndMinutes
