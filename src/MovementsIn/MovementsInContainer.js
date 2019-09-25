import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'

import MovementsIn from './MovementsIn'
import { resetError, setLoaded } from '../redux/actions'
import { ASC } from '../tablesorting/sortOrder'
import Page from '../Components/Page'
import routePaths from '../routePaths'

import SortableDataSource from '../tablesorting/SortableDataSource'
import { lastNameComparator } from '../tablesorting/comparatorComposition'

class MovementsInContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      movementsIn: [],
    }
  }

  componentDidMount() {
    this.getMovementsIn()
  }

  componentDidUpdate(previousProps) {
    const { agencyId, history } = this.props

    if (agencyId !== previousProps.agencyId) {
      history.replace(routePaths.establishmentRoll)
    }
  }

  async getMovementsIn() {
    const { agencyId, handleError, resetErrorDispatch, setLoadedDispatch } = this.props
    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const response = await axios.get(`/api/movements/${agencyId}/in`)
      const movementsIn = response.data
      this.setState({ movementsIn })
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { movementsIn } = this.state
    const { agencyId } = this.props

    return (
      <Page title="In today">
        <SortableDataSource sortOrder={ASC} rows={movementsIn} comparator={lastNameComparator} agencyId={agencyId}>
          <MovementsIn />
        </SortableDataSource>
      </Page>
    )
  }
}

MovementsInContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,

  agencyId: PropTypes.string.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MovementsInContainer)
