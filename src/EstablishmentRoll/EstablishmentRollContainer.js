import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { setEstablishmentRollData } from '../redux/actions'
import EstablishmentRollBlock from './EstablishmentRollBlock'
import Page from '../Components/Page'

export class EstablishmentRollContainer extends Component {
  componentDidMount() {
    const { agencyId } = this.props
    this.getEstablishmentRollBlocks(agencyId)
  }

  componentDidUpdate(prevProps) {
    const { agencyId } = this.props

    if (agencyId !== prevProps.agencyId) {
      this.getEstablishmentRollBlocks(agencyId)
    }
  }

  async getEstablishmentRollBlocks(agencyId) {
    const { setLoadedDispatch, resetErrorDispatch, establishmentRollDataDispatch, handleError } = this.props
    resetErrorDispatch()
    setLoadedDispatch(false)
    try {
      const establishmentRollResponse = await axios.get('/api/establishmentRollCount', {
        params: {
          agencyId,
        },
      })

      establishmentRollDataDispatch({
        ...establishmentRollResponse.data,
      })
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  render() {
    const { movements, blocks, totals } = this.props

    return (
      <Page title="Establishment roll">
        <div className="establishment-roll-container">
          {movements && <EstablishmentRollBlock block={movements} highlight />}
          {blocks &&
            blocks.length > 0 &&
            blocks.map((block, i, array) => {
              const isLastBlock = array.length - 1 === i
              return <EstablishmentRollBlock block={block} key={block.name} isLastBlock={isLastBlock} />
            })}
          {totals && <EstablishmentRollBlock block={totals} highlight />}
        </div>
      </Page>
    )
  }
}

EstablishmentRollContainer.propTypes = {
  // props
  handleError: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  // mapStateToProps
  movements: PropTypes.shape({
    name: PropTypes.string.isRequired,
    numbers: PropTypes.arrayOf(
      PropTypes.shape({ name: PropTypes.string.isRequired, value: PropTypes.number.isRequired })
    ).isRequired,
  }),
  blocks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      numbers: PropTypes.arrayOf(
        PropTypes.shape({ name: PropTypes.string.isRequired, value: PropTypes.number.isRequired })
      ).isRequired,
    }).isRequired
  ),
  totals: PropTypes.shape({
    name: PropTypes.string.isRequired,
    numbers: PropTypes.arrayOf(
      PropTypes.shape({ name: PropTypes.string.isRequired, value: PropTypes.number.isRequired })
    ).isRequired,
  }),
  agencyId: PropTypes.string,
  establishmentRollDataDispatch: PropTypes.func.isRequired,
}

EstablishmentRollContainer.defaultProps = {
  movements: null,
  blocks: null,
  totals: null,
  agencyId: '',
}

const mapStateToProps = state => ({
  movements: state.establishmentRoll.movements,
  blocks: state.establishmentRoll.blocks,
  totals: state.establishmentRoll.totals,
  agencyId: state.app.user.activeCaseLoadId,
})

const mapDispatchToProps = dispatch => ({
  establishmentRollDataDispatch: data => dispatch(setEstablishmentRollData(data)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EstablishmentRollContainer)
