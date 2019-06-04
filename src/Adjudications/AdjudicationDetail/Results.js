import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading/lib/presets'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { LabelAndValue, GridContainer, Section } from './AdjudicationDetail.styles'

export const Results = ({ results }) => (
  <>
    <Section>
      <H3>Results</H3>
      {results && results.length ? (
        results.map((result, i) => (
          <GridContainer i={i} key={result.id} includeTrailingDivider={results.length !== i + 1}>
            <GridRow>
              <GridCol setWidth="20%">
                <LabelAndValue label="Offence paragraph" value={result.oicOffenceCode} />
              </GridCol>
              <GridCol setWidth="15%">
                <LabelAndValue label="Offence type" value={result.offenceType} />
              </GridCol>
              <GridCol setWidth="40%">
                <LabelAndValue label="Offence description" value={result.offenceDescription} />
              </GridCol>
              <GridCol>
                <LabelAndValue label="Plea" value={result.plea} />
              </GridCol>
              <GridCol>
                <LabelAndValue label="Finding" value={result.finding} />
              </GridCol>
            </GridRow>
          </GridContainer>
        ))
      ) : (
        <p>No results available</p>
      )}
    </Section>
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
