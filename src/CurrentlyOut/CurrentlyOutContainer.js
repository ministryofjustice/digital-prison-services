import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'
import { resetError, setLoaded } from '../redux/actions'
import routePaths from '../routePaths'
import Page from '../Components/Page'
import Error from '../Error'
import { ASC } from '../tablesorting/sortOrder'
import SortableDataSource from '../tablesorting/SortableDataSource'
import { lastNameComparator } from '../tablesorting/comparatorComposition'
import CurrentlyOut from './CurrentlyOut'

class CurrentlyOutContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentlyOut: [],
      location: {},
    }
  }

  componentDidMount() {
    this.getOffendersCurrentlyOut()
  }

  componentDidUpdate(previousProps) {
    const { agencyId, history } = this.props

    if (agencyId !== previousProps.agencyId) {
      history.replace(routePaths.establishmentRoll)
    }
  }

  async getOffendersCurrentlyOut() {
    const {
      handleError,
      resetErrorDispatch,
      setLoadedDispatch,
      match: {
        params: { livingUnitId },
      },
    } = this.props

    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const response = await axios.get(`/api/movements/${livingUnitId}/currently-out`)
      const { currentlyOut, location } = response.data
      this.setState({ currentlyOut, location })
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { currentlyOut, location, loaded } = this.state
    const { error } = this.props
    return (
      <Page title={`Currently out - ${location}`} error={error} loaded={loaded}>
        <Error error={error} />
        <SortableDataSource sortOrder={ASC} rows={currentlyOut} comparator={lastNameComparator}>
          <CurrentlyOut />
        </SortableDataSource>
      </Page>
    )
  }
}

CurrentlyOutContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  // history from Redux Router Route
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  // match from Redux Router Route
  match: PropTypes.shape({}).isRequired,

  // redux state
  agencyId: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
}

CurrentlyOutContainer.defaultProps = {
  error: '',
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentlyOutContainer)
