import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import CurrentIepLevelArea from './IepDetails.styles'

const CurrentIepLevel = ({ level, days, nextReviewDate }) => (
  <CurrentIepLevelArea className="current-iep">
    <GridRow>
      <GridCol setWidth="one-quarter">
        <strong className="label">Current IEP level</strong>
        <p>{level}</p>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <strong className="label">Time since review</strong>
        <p>{days}</p>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <strong className="label">Date of next review</strong>
        <p>{nextReviewDate}</p>
      </GridCol>
    </GridRow>
  </CurrentIepLevelArea>
)

CurrentIepLevel.propTypes = {
  level: PropTypes.string,
  days: PropTypes.string,
  nextReviewDate: PropTypes.string,
}

CurrentIepLevel.defaultProps = {
  level: '',
  days: '',
  nextReviewDate: '',
}

const mapStateToProps = state => ({
  level: state.iepHistory.currentIepLevel,
  days: state.iepHistory.daysOnIepLevel,
  nextReviewDate: state.iepHistory.nextReviewDate,
})

export default connect(mapStateToProps)(CurrentIepLevel)
