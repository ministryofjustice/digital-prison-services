import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setEstablishmentRollBlockData } from '../redux/actions/index';
import EstablishmentRollBlock from './EstablishmentRollBlock';
import PropTypes from 'prop-types';
import axios from 'axios';

export class EstablishmentRollContainer extends Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    const { agencyId, establishmentRollBlockDataDispatch } = this.props;
    this.getEstablishmentRollBlocks(agencyId, establishmentRollBlockDataDispatch);
  }

  async getEstablishmentRollBlocks (agencyId, establishmentRollBlockDataDispatch) {
    try {
      const response = await axios.get('/api/establishmentRollCount', {
        params: {
          agencyId
        }
      });
      establishmentRollBlockDataDispatch(response.data);
    } catch (error) {
      this.props.handleError(error);
    }
  }

  render () {
    const { movements, blocks, totals } = this.props;

    return (
      <div className="establishment-roll-container">
        <h1 className="heading-large establishment-roll-container__title">Establishment roll</h1>
        <EstablishmentRollBlock block={movements} highlight />
        {blocks.map((block, i, array) => {
          const isLastBlock = array.length - 1 === i;
          return <EstablishmentRollBlock block={block} key={i} isLastBlock={isLastBlock} />;
        })}
        {totals && <EstablishmentRollBlock block={totals} highlight />}
      </div>
    );
  }
}

EstablishmentRollContainer.propTypes = {
  movements: PropTypes.object,
  blocks: PropTypes.array,
  totals: PropTypes.object,
  agencyId: PropTypes.string,
  establishmentRollBlockDataDispatch: PropTypes.func,
  handleError: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    blocks: state.establishmentRoll.blocks,
    totals: state.establishmentRoll.totals,
    agencyId: state.app.user.activeCaseLoadId
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    establishmentRollBlockDataDispatch: (data) => dispatch(setEstablishmentRollBlockData(data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EstablishmentRollContainer);
