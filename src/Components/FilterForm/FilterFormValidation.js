import { FORM_ERROR } from 'final-form'

const validateThenSubmit = ({ fromDate, toDate, submit }) => values => {
  if (toDate && fromDate && fromDate.isAfter(toDate)) {
    return {
      [FORM_ERROR]: [
        {
          targetName: 'fromDate',
          text: 'The From date must be the same as or before the To date',
        },
        {
          targetName: 'toDate',
          text: 'The To date must be the same as or after the From date',
        },
      ],
    }
  }
  return submit(values)
}

export default validateThenSubmit
