import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'

import MovementsIn from './MovementsIn'
import Spinner from '../Spinner'
import { resetError } from '../redux/actions'
import Error from '../Error'
import { fieldComparator, thenComparing } from '../ResultsHouseblock/comparatorComposition'
import { ASC, DESC } from '../tablesorting/sortOrder'

class MovementsInContainer extends Component {
  lastNameComparator = thenComparing(fieldComparator(obj => obj.lastName), fieldComparator(obj => obj.firstName))

  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      movementsIn: [],
      sortOrder: ASC,
    }
    this.setColumnSort = this.setColumnSort.bind(this)
  }

  componentDidMount() {
    this.getMovementsIn()
  }

  async getMovementsIn() {
    const { agencyId, handleError, resetErrorDispatch } = this.props
    try {
      this.setState({ loaded: false })
      resetErrorDispatch()
      const response = await axios.get(`/api/movements/${agencyId}/in`)
      const movementsIn = response.data
      this.sortMovementsIn(movementsIn, ASC)
      this.setState({ movementsIn, loaded: true })
    } catch (error) {
      handleError(error)
    }
  }

  setColumnSort(sortColumn, sortOrder) {
    this.setState(currentState => {
      const copy = currentState.movementsIn.slice()
      this.sortMovementsIn(copy, sortOrder)
      return { sortOrder, movementsIn: copy }
    })
  }

  sortMovementsIn = (movementsIn, sortOrder) => {
    movementsIn.sort(this.lastNameComparator)
    if (sortOrder === DESC) {
      movementsIn.reverse()
    }
  }

  render() {
    const { movementsIn, loaded, sortOrder } = this.state
    const { error } = this.props

    if (!loaded) {
      return <Spinner />
    }
    return (
      <React.Fragment>
        <Error error={error} />
        <MovementsIn movementsIn={movementsIn} sortOrder={sortOrder} setColumnSort={this.setColumnSort} />
      </React.Fragment>
    )
  }
}

MovementsInContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  // raiseAnalyticsEvent: PropTypes.func.isRequired,

  // redux state
  agencyId: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
}

MovementsInContainer.defaultProps = {
  error: '',
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MovementsInContainer)
