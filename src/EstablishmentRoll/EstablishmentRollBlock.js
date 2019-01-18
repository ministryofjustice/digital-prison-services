import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import './EstablishmentRollBlock.scss'
import pathToRegexp from 'path-to-regexp'
import routePaths from '../routePaths'

const pathsToStatisticsDetailsPages = new Map([
  ['In today', pathToRegexp.compile(routePaths.inToday)],
  ['Out today', pathToRegexp.compile(routePaths.outToday)],
  ['In reception', pathToRegexp.compile(routePaths.inReception)],
  ['Currently out', pathToRegexp.compile(routePaths.currentlyOut)],
  ['En-route', pathToRegexp.compile(routePaths.enRoute)],
  ['Total out', pathToRegexp.compile(routePaths.totalOut)],
])

export class EstablishmentRollBlock extends Component {
  linkPath = (label, livingUnitId) => pathsToStatisticsDetailsPages.get(label)({ livingUnitId })

  renderBlockFigure = (label, value, livingUnitId) => (
    <div className="block-figure">
      <label className="block-figure__label">{label}</label>
      {value === 0 || !pathsToStatisticsDetailsPages.has(label) ? (
        <span className="block-figure__value">{value}</span>
      ) : (
        <Link to={this.linkPath(label, livingUnitId)} className="link">
          <span className="block-figure__value">{value}</span>
        </Link>
      )}
    </div>
  )

  render() {
    const {
      block: { name, livingUnitId, numbers },
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
          {numbers.map(number => (
            <div className="block-figures__figure" key={`${name}_${number.name}`}>
              {this.renderBlockFigure(number.name, number.value, livingUnitId)}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

EstablishmentRollBlock.propTypes = {
  block: PropTypes.shape({
    name: PropTypes.string,
    livingUnitId: PropTypes.number,
    numbers: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, value: PropTypes.number })),
  }),
  highlight: PropTypes.bool,
  isLastBlock: PropTypes.bool,
}

EstablishmentRollBlock.defaultProps = {
  block: {},
  isLastBlock: false,
  highlight: false,
}

export default withRouter(EstablishmentRollBlock)
