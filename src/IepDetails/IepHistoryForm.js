import React from 'react'
import PropTypes from 'prop-types'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Button from '@govuk-react/button'
import moment from 'moment'
import { connect } from 'react-redux'
import { Form } from 'react-final-form'
import ErrorText from '@govuk-react/error-text'
import ErrorSummary from '@govuk-react/error-summary'
import FormDatePicker from '../DatePickers/FormDatePicker'
import { linkOnClick } from '../utils'

import { FullWidthSelect, SearchArea, FiltersLabel, DateRangeLabel } from '../Components/FilterForm/FilterForm.styles'
import { FieldWithError, onHandleErrorClick } from '../final-form-govuk-helpers'
import validateThenSubmit from '../Components/FilterForm/FilterFormValidation'

export const IepHistoryForm = ({ establishments, levels, search, fieldValues, reset, now }) => (
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
              establishments={establishments}
              levels={levels}
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

export const FormFields = ({ now, errors, establishments, levels, submitting, values, reset }) => (
  <>
    <GridRow>
      <GridCol setDesktopWidth="one-half">
        <GridRow>
          <FiltersLabel>Filters</FiltersLabel>
        </GridRow>
        <GridRow>
          <GridCol>
            <FieldWithError
              errors={errors}
              name="establishment"
              component={FullWidthSelect}
              label="Establishment"
              id="establishment-select"
              value={values.iepEstablishment}
            >
              <option value="">All</option>
              {establishments.map(estb => (
                <option key={estb.agencyId} value={estb.agencyId}>
                  {estb.description}
                </option>
              ))}
            </FieldWithError>
          </GridCol>
          <GridCol>
            <FieldWithError
              errors={errors}
              name="level"
              component={FullWidthSelect}
              label="Incentive level"
              id="iep-level-select"
              value={values.iepLevel}
            >
              <option value="">All</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </FieldWithError>
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol setDesktopWidth="one-half">
        <GridRow>
          <DateRangeLabel>Date range</DateRangeLabel>
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

IepHistoryForm.propTypes = {
  now: PropTypes.instanceOf(moment).isRequired,
  search: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  // mapStateToProps
  establishments: PropTypes.arrayOf(
    PropTypes.shape({
      agencyId: PropTypes.string.isRequired,
      agencyType: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  levels: PropTypes.arrayOf(PropTypes.string).isRequired,
  fieldValues: PropTypes.shape({
    establishment: PropTypes.string,
    level: PropTypes.string,
    fromDate: PropTypes.instanceOf(moment),
    toDate: PropTypes.instanceOf(moment),
  }).isRequired,
}

FormFields.propTypes = {
  now: PropTypes.instanceOf(moment).isRequired,
  reset: PropTypes.func.isRequired,
  establishments: PropTypes.arrayOf(
    PropTypes.shape({
      agencyId: PropTypes.string.isRequired,
      agencyType: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  values: PropTypes.shape({
    iepEstablishment: PropTypes.string,
    iepLevel: PropTypes.string,
    fromDate: PropTypes.instanceOf(moment),
    toDate: PropTypes.instanceOf(moment),
  }).isRequired,
  levels: PropTypes.arrayOf(PropTypes.string).isRequired,
  submitting: PropTypes.bool.isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({})),
}

FormFields.defaultProps = {
  errors: [],
}

const mapStateToProps = state => ({
  now: state.iepHistory.now,
  establishments: state.iepHistory.establishments,
  levels: state.iepHistory.levels,
  fieldValues: {
    establishment: state.iepHistory.establishment,
    level: state.iepHistory.level,
    fromDate: state.iepHistory.fromDate,
    toDate: state.iepHistory.toDate,
  },
})

export default connect(mapStateToProps)(IepHistoryForm)
