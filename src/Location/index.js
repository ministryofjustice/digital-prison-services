import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { stripAgencyPrefix } from '../../backend/utils'

const Location = props => {
  const { location, agencyId } = props
  if (!location) return '--'
  return stripAgencyPrefix(location, agencyId) || '--'
}

Location.propTypes = {
  agencyId: PropTypes.string.isRequired,
  location: PropTypes.string,
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
})

export { Location }
export default connect(mapStateToProps)(Location)
