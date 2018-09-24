import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './EstablishmentRollBlock.scss';

class EstablishmentRollBlock extends Component {
  constructor (props) {
    super(props);
  }

  renderBlockNumbersItem (label, value) {
    return (
      <div className="item">
        <label className="item__label">{label}</label>
        <span className="item__value">{value}</span>
      </div>
    );
  }

  render () {
    const { block: { name, numbers }, highlight, isLastBlock } = this.props;
    const blockClasses = classNames({
      'establishment-roll-block': true,
      'establishment-roll-block--highlight': highlight,
      'establishment-roll-block--last': isLastBlock
    });

    return (
      <div className={blockClasses}>
        <h2 className="establishment-roll-block__title">{name}</h2>
        <div className="establishment-roll-block__numbers block-numbers">
          {numbers.map((number, i) => {
            return (
              <div className="block-numbers__item" key={i}>
                {this.renderBlockNumbersItem(number.name, number.value)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

EstablishmentRollBlock.propTypes = {
  block: PropTypes.object,
  highlight: PropTypes.bool,
  isLastBlock: PropTypes.bool
};

export default EstablishmentRollBlock;
