import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Button from '@govuk-react/button'
import { BLUE } from 'govuk-colours'
import CurrentIncentiveLevelArea from './IncentiveLevelDetails.styles'

const CurrentIncentiveLevel = ({ level, days, nextReviewDate, userCanMaintainIep, history }) => (
  <CurrentIncentiveLevelArea className="current-iep">
    <GridRow>
      <GridCol setWidth="one-quarter">
        <strong className="label">Current incentive level</strong>
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
      {userCanMaintainIep && (
        <GridCol setWidth="one-quarter">
          <div>
            <Button
              buttonColour={BLUE}
              onClick={() => history.push(`incentive-level-details/change-incentive-level`)}
              data-qa="change-incentive-level"
            >
              Change incentive level
            </Button>
          </div>
        </GridCol>
      )}
    </GridRow>
  </CurrentIncentiveLevelArea>
)

CurrentIncentiveLevel.propTypes = {
  level: PropTypes.string,
  days: PropTypes.string,
  nextReviewDate: PropTypes.string,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  userCanMaintainIep: PropTypes.bool.isRequired,
}

CurrentIncentiveLevel.defaultProps = {
  level: '',
  days: '',
  nextReviewDate: '',
}

const mapStateToProps = state => ({
  level: state.iepHistory.currentIepLevel,
  days: state.iepHistory.daysOnIepLevel,
  nextReviewDate: state.iepHistory.nextReviewDate,
  userCanMaintainIep: state.iepHistory.userCanMaintainIep,
})

export default connect(mapStateToProps)(CurrentIncentiveLevel)
