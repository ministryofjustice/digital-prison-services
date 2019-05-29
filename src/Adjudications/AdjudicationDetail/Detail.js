import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { H3 } from '@govuk-react/heading/lib/presets'
import { LabelAndValue, IncidentDetails } from './AdjudicationDetail.styles'

export const Detail = ({ detail }) => (
  <>
    <H3>Adjudication Details</H3>
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
            <LabelAndValue label="Establishment" value={detail.establishment} />
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <IncidentDetails label="Detail" value={detail.incidentDetails} />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol setWidth="40%">
        <GridRow>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Location" value={detail.interiorLocation} />
          </GridCol>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Report number" value={detail.reportNumber} />
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Reported by" value={detail.reporterName} />
          </GridCol>
          <GridCol setWidth="one-half">
            <LabelAndValue label="Report date and time" value={detail.reportTime} />
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>
    <hr />
  </>
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

const mapStateToProps = ({ adjudicationHistory: { detail } }) => ({
  detail,
})

export default connect(mapStateToProps)(Detail)
