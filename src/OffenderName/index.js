import PropTypes from 'prop-types'
import { properCaseName } from '../utils'

const OffenderName = props => {
  const { lastName, firstName } = props
  return `${properCaseName(lastName)}, ${properCaseName(firstName)}`
}

OffenderName.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
}

export default OffenderName
