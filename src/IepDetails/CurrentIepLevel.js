import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Button from '@govuk-react/button'
import { BLUE } from 'govuk-colours'
import CurrentIepLevelArea from './IepDetails.styles'

const CurrentIepLevel = ({ level, days, nextReviewDate, userRoles, history }) => (
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
      {userRoles.includes('MAINTAIN_IEP') && (
        <GridCol setWidth="one-quarter">
          <div>
            <Button buttonColour={BLUE} onClick={() => history.push(`iep-details/change-iep`)} data-qa="change-iep">
              Change IEP level
            </Button>
          </div>
        </GridCol>
      )}
    </GridRow>
  </CurrentIepLevelArea>
)

CurrentIepLevel.propTypes = {
  level: PropTypes.string,
  days: PropTypes.string,
  nextReviewDate: PropTypes.string,
  userRoles: PropTypes.arrayOf([PropTypes.string]).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
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
  userRoles: state.app.user.roles,
})

export default connect(mapStateToProps)(CurrentIepLevel)
