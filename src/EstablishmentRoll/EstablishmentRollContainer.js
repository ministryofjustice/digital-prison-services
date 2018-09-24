import React, { Component } from 'react';
import EstablishmentRollBlock from './EstablishmentRollBlock';
import PropTypes from 'prop-types';
import { movements, blocks, totals } from './establishmentRollDummyData';

class EstablishmentRollContainer extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div>
        <h1 className="heading-large">Establishment roll</h1>
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
  blocks: PropTypes.array
};

export default EstablishmentRollContainer;
