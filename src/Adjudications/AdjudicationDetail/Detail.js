import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading/lib/presets'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { LabelAndValue, Location, Section } from './AdjudicationDetail.styles'

export const Detail = ({ detail }) => (
  <Section>
    <H3>Report details</H3>
    <GridRow>
      <GridCol setWidth="60%">
        <GridRow>
          <GridCol setWidth="one-third">
            <LabelAndValue label="Incident date and time" value={detail.incidentTime} />
          </GridCol>
          <GridCol setWidth="one-third">
            <LabelAndValue label="Type" value={detail.reportType} />
          </GridCol>
          <GridCol setWidth="one-third">
            <Location establishment={detail.establishment} interiorLocation={detail.interiorLocation} />
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <LabelAndValue label="Detail" value={detail.incidentDetails} />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol setWidth="40%">
        <GridRow>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Report number" value={detail.reportNumber} />
          </GridCol>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Reported by" value={detail.reporterName} />
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Report date and time" value={detail.reportTime} />
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>
  </Section>
)

Detail.propTypes = {
  detail: PropTypes.shape({
    incidentTime: PropTypes.string,
    reportType: PropTypes.string,
    establishment: PropTypes.string,
    incidentDetails: PropTypes.string,
    interiorLocation: PropTypes.string,
    reportNumber: PropTypes.number,
    reporterName: PropTypes.string,
    reporterTime: PropTypes.string,
  }),
}

Detail.defaultProps = {
  detail: {},
}

const mapStateToProps = ({ adjudicationHistory: { detail } }) => ({
  detail,
})

export default connect(mapStateToProps)(Detail)
