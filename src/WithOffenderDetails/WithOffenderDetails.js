import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'
import { resetError, setLoaded, setOffender } from '../redux/actions'

export class WithOffenderDetails extends React.Component {
  async componentDidMount() {
    const {
      setLoaded: setLoadedDispatch,
      resetError: resetErrorDispatch,
      setOffender: setOffenderDispatch,
      offenderNumber,
      handleError,
      client,
    } = this.props

    resetErrorDispatch()
    try {
      const { data } = await client.get(`/api/offenders/${offenderNumber}`)
      setLoadedDispatch(true)
      setOffenderDispatch(data)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { children } = this.props
    return children
  }
}

WithOffenderDetails.propTypes = {
  client: PropTypes.func,
  offenderNumber: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  handleError: PropTypes.func.isRequired,
  /* Map dispatch to props */
  setLoaded: PropTypes.func.isRequired,
  setOffender: PropTypes.func.isRequired,
  resetError: PropTypes.func.isRequired,
}

WithOffenderDetails.defaultProps = {
  client: axios,
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  setLoaded,
  resetError,
  setOffender,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithOffenderDetails)
