import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'

import MovementsIn from './MovementsIn'
import { resetError, setLoaded } from '../redux/actions'
import Error from '../Error'
import { fieldComparator, thenComparing } from '../tablesorting/comparatorComposition'
import { ASC, DESC } from '../tablesorting/sortOrder'
import Page from '../Page/Page'
import routePaths from '../routePaths'

class MovementsInContainer extends Component {
  lastNameComparator = thenComparing(
    thenComparing(fieldComparator(obj => obj.lastName), fieldComparator(obj => obj.firstName)),
    fieldComparator(obj => obj.offenderNo)
  )

  constructor(props) {
    super(props)
    this.state = {
      movementsIn: [],
      sortOrder: ASC,
    }
    this.setColumnSort = this.setColumnSort.bind(this)
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
      this.sortMovementsIn(movementsIn, ASC)
      this.setState({ movementsIn })
      setLoadedDispatch(true)
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

    return (
      <Page title="In today" error={error} loaded={loaded}>
        <Error error={error} />
        <MovementsIn movementsIn={movementsIn} sortOrder={sortOrder} setColumnSort={this.setColumnSort} />
      </Page>
    )
  }
}

MovementsInContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,

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
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MovementsInContainer)
