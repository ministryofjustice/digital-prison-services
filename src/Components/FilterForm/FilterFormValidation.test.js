import { FORM_ERROR } from 'final-form'
import moment from 'moment'
import validateThenSubmit from './FilterFormValidation'

describe('Filter form validation', () => {
  const formValues = { establishment: 'MDI' }

  it('should return validation messages for date validation', () => {
    const fromDate = moment('2019-01-02')
    const toDate = moment('2019-01-01')

    const submit = jest.fn()

    const validator = validateThenSubmit({ fromDate, toDate, submit })
    const validationMessages = validator(formValues)[FORM_ERROR]

    expect(validationMessages).toEqual([
      {
        targetName: 'fromDate',
        text: 'The From date must be the same as or before the To date',
      },
      {
        targetName: 'toDate',
        text: 'The To date must be the same as or after the From date',
      },
    ])

    expect(submit).toHaveBeenCalledTimes(0)
  })

  it('should call onSubmit with the values when there are no validation error', done => {
    const submit = values => {
      expect(values).toEqual(formValues)
      done()
    }

    const fromDate = moment('2019-01-01')
    const toDate = moment('2019-01-02')

    const validator = validateThenSubmit({ fromDate, toDate, submit })
    const validationMessages = validator(formValues)

    expect(validationMessages).toBeUndefined()
  })

  it('Searching on a single date is ok', done => {
    const submit = values => {
      expect(values).toEqual(formValues)
      done()
    }

    const fromDate = moment('2019-01-01')
    const toDate = moment('2019-01-01')

    const validator = validateThenSubmit({ fromDate, toDate, submit })
    const validationMessages = validator(formValues)

    expect(validationMessages).toBeUndefined()
  })
})
