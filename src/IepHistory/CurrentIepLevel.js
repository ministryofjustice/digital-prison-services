import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import CurrentIepLevelArea from './IepHistory.styles'

const CurrentIepLevel = ({ level, days, nextReviewDate }) => (
  <CurrentIepLevelArea>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <strong className="label">Current IEP level</strong>
        <p>{level}</p>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <strong className="label">Days since review</strong>
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
  level: PropTypes.string.isRequired,
  days: PropTypes.number.isRequired,
  nextReviewDate: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
  level: state.iepHistory.currentIepLevel,
  days: state.iepHistory.daysOnIepLevel,
  nextReviewDate: state.iepHistory.nextReviewDate,
})

export default connect(mapStateToProps)(CurrentIepLevel)
