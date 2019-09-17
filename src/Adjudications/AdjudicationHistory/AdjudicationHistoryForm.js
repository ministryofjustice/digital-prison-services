import React from 'react'
import PropTypes from 'prop-types'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Button from '@govuk-react/button'
import moment from 'moment'
import ErrorSummary from '@govuk-react/error-summary'
import ErrorText from '@govuk-react/error-text'
import { connect } from 'react-redux'
import { Form } from 'react-final-form'
import FormDatePicker from '../../DatePickers/FormDatePicker'
import { linkOnClick } from '../../utils'
import validateThenSubmit from '../../Components/FilterForm/FilterFormValidation'
import {
  FullWidthSelect,
  SearchArea,
  FiltersLabel,
  DateRangeLabel,
  LargeScreenOnlyGridCol,
} from '../../Components/FilterForm/FilterForm.styles'
import { FieldWithError, onHandleErrorClick } from '../../final-form-govuk-helpers'

export const AdjudicationHistoryForm = ({ agencies, search, fieldValues, reset, now }) => (
  <Form
    initialValues={fieldValues}
    onSubmit={values => {
      const errors = validateThenSubmit({
        fromDate: values.fromDate,
        toDate: values.toDate,
        submit: search,
      })(values)
      if (errors) window.scrollTo(0, 0)
      return errors
    }}
    render={({ error, handleSubmit, submitError, submitting, form, values }) => (
      <>
        {error && <ErrorText> {error} </ErrorText>}
        {submitError && (
          <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={submitError} />
        )}
        <form onSubmit={handleSubmit}>
          <SearchArea>
            <FormFields
              now={now}
              errors={submitError}
              submitting={submitting}
              agencies={agencies}
              values={values}
              reset={() => {
                reset().then(() => form.reset({}))
              }}
            />
          </SearchArea>
        </form>
      </>
    )}
  />
)

const shouldShowDay = now => date => date.isSameOrBefore(now, 'day')

export const FormFields = ({ now, errors, submitting, agencies = [], values, reset }) => (
  <>
    <GridRow>
      <GridCol setDesktopWidth="one-third">
        <GridRow>
          <FiltersLabel>Filters</FiltersLabel>
        </GridRow>
        <GridRow>
          <LargeScreenOnlyGridCol>
            <FieldWithError
              errors={errors}
              name="establishment"
              component={FullWidthSelect}
              label="Establishment"
              id="establishment-select"
              value={values.establishment}
            >
              <option value="">All</option>
              {agencies.map(agency => (
                <option key={agency.agencyId} value={agency.agencyId}>
                  {agency.description}
                </option>
              ))}
            </FieldWithError>
          </LargeScreenOnlyGridCol>
        </GridRow>
      </GridCol>
      <GridCol setDesktopWidth="two-thirds">
        <GridRow>
          <DateRangeLabel>Reported date</DateRangeLabel>
        </GridRow>
        <GridRow>
          <GridCol id="from-date" setDesktopWidth="one-third">
            <FieldWithError
              errors={errors}
              name="fromDate"
              component={FormDatePicker}
              label="From"
              value={values.fromDate}
              shouldShowDay={shouldShowDay(now)}
            />
          </GridCol>
          <GridCol id="to-date" setDesktopWidth="one-third">
            <FieldWithError
              errors={errors}
              name="toDate"
              component={FormDatePicker}
              label="To"
              value={values.toDate}
              shouldShowDay={shouldShowDay(now)}
            />
          </GridCol>
          <GridCol setDesktopWidth="one-third">
            <p className="form-label visible-md visible-lg" />
            <Button id="apply-filter" disabled={submitting} type="submit">
              Apply filters
            </Button>
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>
    <a id="clear-filters" className="clear-filters link clickable" {...linkOnClick(reset)}>
      Clear filters
    </a>
  </>
)

AdjudicationHistoryForm.propTypes = {
  now: PropTypes.instanceOf(moment).isRequired,
  search: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  // mapStateToProps
  agencies: PropTypes.arrayOf(
    PropTypes.shape({
      agencyId: PropTypes.string.isRequired,
      agencyType: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  fieldValues: PropTypes.shape({
    establishment: PropTypes.string,
    fromDate: PropTypes.instanceOf(moment),
    toDate: PropTypes.instanceOf(moment),
  }).isRequired,
}

FormFields.propTypes = {
  now: PropTypes.instanceOf(moment).isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({})),
  submitting: PropTypes.bool.isRequired,
  agencies: PropTypes.arrayOf(
    PropTypes.shape({
      agencyId: PropTypes.string.isRequired,
      agencyType: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  values: PropTypes.shape({
    establishment: PropTypes.string,
    fromDate: PropTypes.instanceOf(moment),
    toDate: PropTypes.instanceOf(moment),
  }).isRequired,
  reset: PropTypes.func.isRequired,
}

FormFields.defaultProps = {
  errors: [],
}

const mapStateToProps = state => ({
  now: state.adjudicationHistory.now,
  agencies: state.adjudicationHistory.agencies,
  fieldValues: {
    establishment: state.adjudicationHistory.establishment,
    fromDate: state.adjudicationHistory.fromDate,
    toDate: state.adjudicationHistory.toDate,
  },
})

export default connect(mapStateToProps)(AdjudicationHistoryForm)
