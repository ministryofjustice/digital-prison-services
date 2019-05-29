import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { H3 } from '@govuk-react/heading/lib/presets'
import { LabelAndValue } from './AdjudicationDetail.styles'

export const Results = ({ results }) => (
  <>
    <H3>Results</H3>
    {results && results.length ? (
      results.map(result => (
        <Fragment key={result.id}>
          <GridRow>
            <GridCol>
              <LabelAndValue label="Offence Paragraph" value={result.oicOffenceCode} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Offence Type" value={result.offenceType} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Offence Description" value={result.offenceDescription} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Plea" value={result.plea} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Finding" value={result.finding} />
            </GridCol>
          </GridRow>
        </Fragment>
      ))
    ) : (
      <p>No information available</p>
    )}
    <hr />
  </>
)

Results.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      oicOffenceCode: PropTypes.string,
      offenceType: PropTypes.string,
      offenceDescription: PropTypes.string,
      plea: PropTypes.string,
      finding: PropTypes.string,
    })
  ),
}

const mapStateToProps = ({
  adjudicationHistory: {
    detail: { results },
  },
}) => ({
  results,
})

export default connect(mapStateToProps)(Results)
