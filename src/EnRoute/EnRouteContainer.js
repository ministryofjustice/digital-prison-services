import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'

import EnRoute from './EnRoute'
import { resetError, setLoaded } from '../redux/actions'
import { ASC } from '../tablesorting/sortOrder'
import Page from '../Components/Page'
import routePaths from '../routePaths'

import SortableDataSource from '../tablesorting/SortableDataSource'
import { lastNameComparator } from '../tablesorting/comparatorComposition'

class EnRouteContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offenders: [],
    }
  }

  componentDidMount() {
    this.getOffendersEnRoute()
  }

  componentDidUpdate(previousProps) {
    const { agencyId, history } = this.props

    if (agencyId !== previousProps.agencyId) {
      history.replace(routePaths.establishmentRoll)
    }
  }

  async getOffendersEnRoute() {
    const { agencyId, handleError, resetErrorDispatch, setLoadedDispatch } = this.props
    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const response = await axios.get(`/api/movements/${agencyId}/en-route`)
      const offenders = response.data
      this.setState({ offenders })
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { offenders } = this.state
    const { agencyId, caseLoadOptions } = this.props
    const { description } = caseLoadOptions.find(cl => cl.caseLoadId === agencyId)
    const pageTitle = `En route to ${description}`

    return (
      <Page title={pageTitle}>
        <SortableDataSource sortOrder={ASC} rows={offenders} comparator={lastNameComparator}>
          <EnRoute />
        </SortableDataSource>
      </Page>
    )
  }
}

EnRouteContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,

  agencyId: PropTypes.string.isRequired,
  caseLoadOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  caseLoadOptions: state.app.user.caseLoadOptions,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnRouteContainer)
