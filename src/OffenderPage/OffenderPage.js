import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'
import { childrenType } from '../types'
import { resetError, setLoaded, setOffender } from '../redux/actions'
import Page from '../Components/Page'

export class OffenderPage extends React.Component {
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
    const { children, title, offenderDetails } = this.props
    return <Page title={offenderDetails.firstName && title(offenderDetails)}>{children}</Page>
  }
}

OffenderPage.propTypes = {
  client: PropTypes.func,
  title: PropTypes.func.isRequired,
  offenderNumber: PropTypes.string.isRequired,
  children: childrenType,
  handleError: PropTypes.func.isRequired,
  /* Map state to props */
  offenderDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
  /* Map dispatch to props */
  setLoaded: PropTypes.func.isRequired,
  setOffender: PropTypes.func.isRequired,
  resetError: PropTypes.func.isRequired,
}

OffenderPage.defaultProps = {
  client: axios,
  offenderDetails: undefined,
  children: undefined,
}

const mapStateToProps = state => ({
  offenderDetails: state.offenderDetails,
})

const mapDispatchToProps = {
  setLoaded,
  resetError,
  setOffender,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OffenderPage)
