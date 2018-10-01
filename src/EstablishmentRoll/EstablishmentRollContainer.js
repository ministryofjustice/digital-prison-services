import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setEstablishmentRollData, setLoaded } from '../redux/actions';
import EstablishmentRollBlock from './EstablishmentRollBlock';
import Spinner from '../Spinner';
import Error from '../Error';
import axios from 'axios';

export class EstablishmentRollContainer extends Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    this.getEstablishmentRollBlocks(this.props.agencyId);
  }

  async getEstablishmentRollBlocks (agencyId) {
    const { setLoadedDispatch, establishmentRollDataDispatch, handleError } = this.props;

    setLoadedDispatch(false);
    try {
      const establishmentRollResponse = await axios.get('/api/establishmentRollCount', {
        params: {
          agencyId
        }
      });

      establishmentRollDataDispatch({
        ...establishmentRollResponse.data
      });
    } catch (error) {
      handleError(error);
    }
    setLoadedDispatch(true);
  }

  render () {
    const { movements, blocks, totals, loaded, error } = this.props;
    if (!loaded) return <Spinner />;

    if (error) return <Error {...this.props} />;

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
  establishmentRollDataDispatch: PropTypes.func,
  setLoadedDispatch: PropTypes.func,
  handleError: PropTypes.func,
  loaded: PropTypes.bool,
  error: PropTypes.string
};

const mapStateToProps = state => {
  return {
    blocks: state.establishmentRoll.blocks,
    totals: state.establishmentRoll.totals,
    movements: state.establishmentRoll.movements,
    agencyId: state.app.user.activeCaseLoadId,
    loaded: state.app.loaded
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    establishmentRollDataDispatch: data => dispatch(setEstablishmentRollData(data)),
    setLoadedDispatch: status => dispatch(setLoaded(status))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EstablishmentRollContainer);
