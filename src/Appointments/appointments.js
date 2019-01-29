import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Page from '../Components/Page'
import routePaths from '../routePaths'

import { setApplicationTitle, setLoaded, resetError } from '../redux/actions'

class Appointments extends Component {
  componentDidMount() {
    const { titleDispatch, setLoadedDispatch, resetErrorDispatch } = this.props

    resetErrorDispatch()
    setLoadedDispatch(true)

    titleDispatch('Bulk appointments')
  }

  render() {
    return (
      <Page title="Bulk appoinments">
        <div>
          <Link to={routePaths.uploadOffenders}> Upload csv file </Link>
        </div>
      </Page>
    )
  }
}

Appointments.propTypes = {
  titleDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = () => ({})
const mapDispatchToProps = dispatch => ({
  titleDispatch: title => dispatch(setApplicationTitle(title)),
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Appointments)
