import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setEstablishmentRollBlockData, setLoaded } from '../redux/actions';
import EstablishmentRollBlock from './EstablishmentRollBlock';
import Spinner from '../Spinner';
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
      this.props.setLoadedDispatch(false);
      const response = await axios.get('/api/establishmentRollCount', {
        params: {
          agencyId
        }
      });
      establishmentRollBlockDataDispatch(response.data);
    } catch (error) {
      this.props.handleError(error);
    }
    this.props.setLoadedDispatch(true);
  }

  render () {
    const { movements, blocks, totals, loaded } = this.props;

    if (!loaded) {
      return <Spinner />;
    }

    return (
      <div className="establishment-roll-container">
        <h1 className="heading-large establishment-roll-container__title">Establishment roll</h1>
        <EstablishmentRollBlock block={movements} highlight />
        {blocks.map((block, i, array) => {
          const isLastBlock = array.length - 1 === i;
          return <EstablishmentRollBlock block={block} key={i} isLastBlock={isLastBlock} />;
        })}
        <EstablishmentRollBlock block={totals} highlight />
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
  setLoadedDispatch: PropTypes.func,
  handleError: PropTypes.func,
  loaded: PropTypes.bool
};

const mapStateToProps = (state) => {
  return {
    blocks: state.establishmentRoll.blocks,
    totals: state.establishmentRoll.totals,
    agencyId: state.app.user.activeCaseLoadId,
    loaded: state.app.loaded
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    establishmentRollBlockDataDispatch: (data) => dispatch(setEstablishmentRollBlockData(data)),
    setLoadedDispatch: (status) => dispatch(setLoaded(status))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EstablishmentRollContainer);
