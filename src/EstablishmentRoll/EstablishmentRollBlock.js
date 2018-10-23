import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './EstablishmentRollBlock.scss'

class EstablishmentRollBlock extends Component {
  renderBlockFigure(label, value) {
    return (
      <div className="block-figure">
        <label className="block-figure__label">{label}</label>
        <span className="block-figure__value">{value}</span>
      </div>
    )
  }

  render() {
    const {
      block: { name, numbers },
      highlight,
      isLastBlock,
    } = this.props
    const blockClasses = classNames({
      'establishment-roll-block': true,
      'establishment-roll-block--highlight': highlight,
      'establishment-roll-block--last': isLastBlock,
    })

    return (
      <div className={blockClasses}>
        <h2 className="establishment-roll-block__title">{name}</h2>
        <div className="establishment-roll-block__figures block-figures">
          {numbers.map((number, i) => (
            <div className="block-figures__figure" key={i}>
              {this.renderBlockFigure(number.name, number.value)}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

EstablishmentRollBlock.propTypes = {
  block: PropTypes.object,
  highlight: PropTypes.bool,
  isLastBlock: PropTypes.bool,
}

export default EstablishmentRollBlock
