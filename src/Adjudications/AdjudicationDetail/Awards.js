import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading/lib/presets'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { LabelAndValue, GridContainer, Section } from './AdjudicationDetail.styles'

export const Awards = ({ awards }) => (
  <>
    <Section>
      <H3>Awards</H3>
      {awards && awards.length ? (
        awards.map((award, i) => (
          <GridContainer key={award.id} includeTrailingDivider={awards.length !== i + 1}>
            <GridRow>
              <GridCol setWidth="one-quarter">
                <LabelAndValue label="Type" value={award.sanctionType} />
              </GridCol>
              <GridCol setWidth="one-quarter">
                <LabelAndValue label="Length of time" value={award.duration} />
              </GridCol>
              <GridCol setWidth="one-quarter">
                <LabelAndValue label="Effective date" value={award.effectiveDate} />
              </GridCol>
              <GridCol setWidth="one-quarter">
                <LabelAndValue label="Status" value={award.status} />
              </GridCol>
            </GridRow>
            {award.comment && (
              <GridRow>
                <GridCol>
                  <LabelAndValue label="Comments" value={award.comment} />
                </GridCol>
              </GridRow>
            )}
          </GridContainer>
        ))
      ) : (
        <p>No awards available</p>
      )}
    </Section>
  </>
)

Awards.propTypes = {
  awards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      sanctionType: PropTypes.string,
      duration: PropTypes.string,
      effectiveDate: PropTypes.string,
      status: PropTypes.string,
      comment: PropTypes.string,
    })
  ),
}

Awards.defaultProps = {
  awards: [],
}

const mapStateToProps = ({
  adjudicationHistory: {
    detail: { sanctions },
  },
}) => ({
  awards: sanctions,
})

export default connect(mapStateToProps)(Awards)
