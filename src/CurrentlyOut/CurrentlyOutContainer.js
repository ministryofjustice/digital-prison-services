import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'
import { resetError, setLoaded } from '../redux/actions'
import routePaths from '../routePaths'
import Page from '../Components/Page'
import { ASC } from '../tablesorting/sortOrder'
import SortableDataSource from '../tablesorting/SortableDataSource'
import { lastNameComparator } from '../tablesorting/comparatorComposition'
import CurrentlyOut from './CurrentlyOut'

// Data fetchers. One of these is passed to the CurrentlyOut container by a Route in App.js.
// params is the
export const fetchLivingUnitData = params => async () => {
  const response = await axios.get(`/api/movements/livingUnit/${params.livingUnitId}/currently-out`)
  const { currentlyOut, location } = response.data
  return { currentlyOut, location: `Currently out - ${location}` }
}

export const fetchAgencyData = agencyId => async () => {
  const response = await axios.get(`/api/movements/agency/${agencyId}/currently-out`)
  const currentlyOut = response.data
  return { currentlyOut, location: 'Total currently out' }
}

class CurrentlyOutContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentlyOut: [],
      location: '',
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
    const { dataFetcher, handleError, resetErrorDispatch, setLoadedDispatch } = this.props

    try {
      resetErrorDispatch()
      setLoadedDispatch(false)

      const nextState = await dataFetcher()

      this.setState(nextState)
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { currentlyOut, location } = this.state
    return (
      <Page title={location}>
        <SortableDataSource sortOrder={ASC} rows={currentlyOut} comparator={lastNameComparator}>
          <CurrentlyOut />
        </SortableDataSource>
      </Page>
    )
  }
}

CurrentlyOutContainer.propTypes = {
  dataFetcher: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  // history from Redux Router Route
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,

  // redux state
  agencyId: PropTypes.string.isRequired,

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
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
