import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'

import MovementsOut from './MovementsOut'
import { resetError, setLoaded } from '../redux/actions'
import Error from '../Error'
import { fieldComparator, thenComparing } from '../tablesorting/comparatorComposition'
import { ASC, DESC } from '../tablesorting/sortOrder'
import Page from '../Page/Page'

class MovementsOutContainer extends Component {
  lastNameComparator = thenComparing(
    thenComparing(fieldComparator(obj => obj.lastName), fieldComparator(obj => obj.firstName)),
    fieldComparator(obj => obj.offenderNo)
  )

  constructor(props) {
    super(props)
    this.state = {
      movementsOut: [],
      sortOrder: ASC,
    }
    this.setColumnSort = this.setColumnSort.bind(this)
  }

  componentDidMount() {
    this.getMovementsOut()
  }

  componentDidUpdate(props) {
    const { agencyId } = this.props

    if (agencyId !== props.agencyId) {
      this.getMovementsOut()
    }
  }

  async getMovementsOut() {
    const { agencyId, handleError, resetErrorDispatch, setLoadedDispatch } = this.props
    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const response = await axios.get(`/api/movements/${agencyId}/out`)
      const movementsOut = response.data
      this.sortMovementsOut(movementsOut, ASC)
      this.setState({ movementsOut })
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  setColumnSort(sortColumn, sortOrder) {
    this.setState(currentState => {
      const copy = currentState.movementsOut.slice()
      this.sortMovementsOut(copy, sortOrder)
      return { sortOrder, movementsOut: copy }
    })
  }

  sortMovementsOut = (movementsOut, sortOrder) => {
    movementsOut.sort(this.lastNameComparator)
    if (sortOrder === DESC) {
      movementsOut.reverse()
    }
  }

  render() {
    const { movementsOut, loaded, sortOrder } = this.state
    const { error } = this.props

    return (
      <Page title="Out today" error={error} loaded={loaded}>
        <Error error={error} />
        <MovementsOut movementsOut={movementsOut} sortOrder={sortOrder} setColumnSort={this.setColumnSort} />
      </Page>
    )
  }
}

MovementsOutContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  resetErrorDispatch: PropTypes.func.isRequired,
}

MovementsOutContainer.defaultProps = {
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
)(MovementsOutContainer)
