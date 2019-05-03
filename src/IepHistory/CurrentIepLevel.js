import React from 'react'
import PropTypes from 'prop-types'
import { H3 } from '@govuk-react/heading'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import DateFormatter from '../DateFormatter'

const CurrentIepLevel = ({ level, days }) => (
  <React.Fragment>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <H3>Current IEP level</H3>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <H3>Days since review</H3>
      </GridCol>
      <GridCol setWidth="one-quarter">
        <H3>Date of next review</H3>
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
