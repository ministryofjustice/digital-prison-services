import moment from 'moment'
import { validateThenSubmit } from './CreateAlertForm'
import { DATE_ONLY_FORMAT_SPEC } from '../dateHelpers'

const getErrors = errors => errors['FINAL_FORM/form-error']

describe('Create alert validation', () => {
  const defaults = {
    alertType: 'A',
    alertSubType: 'B',
    comment: 'stuff',
    effectiveDate: moment().format(DATE_ONLY_FORMAT_SPEC),
  }

  it('should flag missing fields', () => {
    const errors = getErrors(validateThenSubmit()({}))
    expect(errors).toEqual([
      {
        targetName: 'alertType',
        text: 'Select a type of alert',
      },
      {
        targetName: 'alertSubType',
        text: 'Select an alert',
      },
      {
        targetName: 'comment',
        text: 'Comment required',
      },
      {
        targetName: 'effectiveDate',
        text: 'Select an effective date',
      },
    ])
  })

  it('should validate the length of the comment field', () => {
    const errors = getErrors(
      validateThenSubmit()({
        ...defaults,
        comment: [...Array(10001).keys()],
      })
    )

    expect(errors).toEqual([
      {
        targetName: 'comment',
        text: 'Enter a comment using 1000 characters or less',
      },
    ])
  })
})
