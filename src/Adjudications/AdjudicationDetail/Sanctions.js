import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { H3 } from '@govuk-react/heading/lib/presets'
import { LabelAndValue, Sanction } from './AdjudicationDetail.styles'

export const Sanctions = ({ sanctions }) => (
  <>
    <H3>Awards</H3>
    {sanctions && sanctions.length ? (
      sanctions.map(sanction => (
        <Sanction key={sanction.id}>
          <GridRow>
            <GridCol setWidth="one-quarter">
              <LabelAndValue label="Type" value={sanction.sanctionType} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Length of time" value={sanction.duration} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Effective date" value={sanction.effectiveDate} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Status" value={sanction.status} />
            </GridCol>
            <GridCol>
              <LabelAndValue label="Status date" value={sanction.statusDate} />
            </GridCol>
          </GridRow>
          {sanction.comment && (
            <GridRow>
              <GridCol>
                <LabelAndValue label="Comments" value={sanction.comment} />
              </GridCol>
            </GridRow>
          )}
        </Sanction>
      ))
    ) : (
      <p>No information available</p>
    )}
    <hr />
  </>
)

Sanctions.propTypes = {
  sanctions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      sanctionType: PropTypes.string,
      duration: PropTypes.string,
      effectiveDate: PropTypes.string,
      status: PropTypes.string,
      statusDate: PropTypes.string,
      comment: PropTypes.string,
    })
  ),
}

const mapStateToProps = ({
  adjudicationHistory: {
    detail: { sanctions },
  },
}) => ({
  sanctions,
})

export default connect(mapStateToProps)(Sanctions)
