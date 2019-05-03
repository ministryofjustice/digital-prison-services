import React from 'react'
import PropTypes from 'prop-types'
import { H4 } from '@govuk-react/heading'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import DateFormatter from '../DateFormatter'

const CurrentIepLevel = ({ level, days }) => (
  <React.Fragment>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <H4>Current IEP level</H4>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <H4>Days since review</H4>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <H4>Date of next review</H4>
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol setWidth="one-quarter">{level}</GridCol>
      <GridCol setWidth="one-quarter">{days}</GridCol>
      <GridCol setWidth="one-quarter" />
    </GridRow>
  </React.Fragment>
)

CurrentIepLevel.propTypes = {
  level: PropTypes.string.isRequired,
  days: PropTypes.number.isRequired,
}

export default CurrentIepLevel
