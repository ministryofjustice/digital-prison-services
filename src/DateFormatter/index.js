import PropTypes from 'prop-types'
import moment from 'moment'

const FormattedDate = ({ isoDate }) => {
  if (!isoDate) return ''
  return moment(isoDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
}

FormattedDate.propTypes = {
  isoDate: PropTypes.string,
}

export default FormattedDate
