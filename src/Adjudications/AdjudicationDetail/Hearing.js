import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading/lib/presets'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { LabelAndValue, Location, Section } from './AdjudicationDetail.styles'

export const Hearing = ({ hearing }) => (
  <>
    <Section>
      <H3>Hearing details</H3>
      {hearing ? (
        <>
          <GridRow>
            <GridCol setWidth="20%">
              <LabelAndValue label="Type" value={hearing.hearingType} />
            </GridCol>
            <GridCol setWidth="20%">
              <LabelAndValue label="Date" value={hearing.hearingTime} />
            </GridCol>
            <GridCol setWidth="20%">
              <Location establishment={hearing.establishment} interiorLocation={hearing.location} />
            </GridCol>
            <GridCol setWidth="20%">
              <LabelAndValue label="Heard by" value={hearing.heardByName} />
            </GridCol>
            <GridCol setWidth="20%">
              <LabelAndValue label="Other representatives" value={hearing.otherRepresentatives} />
            </GridCol>
          </GridRow>
          {hearing.comment && (
            <GridRow>
              <GridCol>
                <LabelAndValue label="Comments" value={hearing.comment} />
              </GridCol>
            </GridRow>
          )}
        </>
      ) : (
        <p>No information available</p>
      )}
    </Section>
  </>
)

Hearing.propTypes = {
  hearing: PropTypes.shape({
    hearingType: PropTypes.string,
    hearingTime: PropTypes.string,
    establishment: PropTypes.string,
    location: PropTypes.string,
    heardByName: PropTypes.string,
    otherRepresentatives: PropTypes.string,
    comment: PropTypes.string,
  }),
}

const mapStateToProps = ({
  adjudicationHistory: {
    detail: { hearing },
  },
}) => ({
  hearing,
})

export default connect(mapStateToProps)(Hearing)
