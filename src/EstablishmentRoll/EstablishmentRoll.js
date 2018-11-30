import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { setEstablishmentRollData, setApplicationTitle } from '../redux/actions'
import EstablishmentRollBlock from './EstablishmentRollBlock'
import Page from '../Page/Page'

export class EstablishmentRoll extends Component {
  componentDidMount() {
    const { agencyId, titleDispatch } = this.props
    titleDispatch('Establishment roll')
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
          <EstablishmentRollBlock block={movements} highlight />
          {blocks.map((block, i, array) => {
            const isLastBlock = array.length - 1 === i
            return <EstablishmentRollBlock block={block} key={block.name} isLastBlock={isLastBlock} />
          })}
          <EstablishmentRollBlock block={totals} highlight />
        </div>
      </Page>
    )
  }
}

EstablishmentRoll.propTypes = {
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
  // mapDispatchToProps
  establishmentRollDataDispatch: PropTypes.func.isRequired,
  titleDispatch: PropTypes.func.isRequired,
}

EstablishmentRoll.defaultProps = {
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
  titleDispatch: title => dispatch(setApplicationTitle(title)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EstablishmentRoll)
