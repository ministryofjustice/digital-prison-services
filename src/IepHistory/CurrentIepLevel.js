import React from 'react'
import PropTypes from 'prop-types'
import { H4 } from '@govuk-react/heading'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'

const CurrentIepLevel = ({ level, days, nextReviewDate }) => (
  <React.Fragment>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <strong className="label">Current IEP level</strong>
        <div>{level}</div>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <strong className="label">Days since review</strong>
        <div>{days}</div>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <strong className="label">Date of next review</strong>
        <div>{nextReviewDate}</div>
      </GridCol>
    </GridRow>
  </React.Fragment>
)

CurrentIepLevel.propTypes = {
  level: PropTypes.string,
  days: PropTypes.number,
  nextReviewDate: PropTypes.string,
}

CurrentIepLevel.defaultProps = {
  level: '',
  days: 0,
  nextReviewDate: '',
}

export default CurrentIepLevel
