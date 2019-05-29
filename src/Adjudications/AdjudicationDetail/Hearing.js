import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { H3 } from '@govuk-react/heading/lib/presets'
import { LabelAndValue } from './AdjudicationDetail.styles'

export const Hearing = ({ hearing }) => (
  <>
    <H3>Hearing Details</H3>
    {hearing ? (
      <>
        <GridRow>
          <GridCol>
            <LabelAndValue label="Type" value={hearing.hearingType} />
          </GridCol>
          <GridCol>
            <LabelAndValue label="Date" value={hearing.hearingTime} />
          </GridCol>
          <GridCol>
            <LabelAndValue label="Location" value={hearing.location} />
          </GridCol>
          <GridCol>
            <LabelAndValue label="Heard by" value={hearing.heardByName} />
          </GridCol>
          <GridCol>
            <LabelAndValue label="Other representatives" value={hearing.otherRepresentatives} />
          </GridCol>
          <GridCol>
            <LabelAndValue label="Comment" value={hearing.comment} />
          </GridCol>
        </GridRow>
      </>
    ) : (
      <p>No information available</p>
    )}
    <hr />
  </>
)

Hearing.propTypes = {
  hearing: PropTypes.shape({
    hearingType: PropTypes.string,
    hearingTime: PropTypes.string,
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
