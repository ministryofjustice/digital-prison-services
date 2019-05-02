import PropTypes from 'prop-types'
import moment from 'moment'

const FormattedDateTime = ({ isoDate }) => {
  if (!isoDate) return ''
  return moment(isoDate, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY - HH:mm')
}

FormattedDateTime.propTypes = {
  isoDate: PropTypes.string,
}

export default FormattedDateTime
