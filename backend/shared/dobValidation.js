const moment = require('moment')

module.exports = (dobDay, dobMonth, dobYear) => {
  const dateOfBirth = moment({ day: dobDay, month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1, year: dobYear })
  const dobIsValid = dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)
  const dobErrors = []

  if (dobDay && dobMonth && dobYear) {
    const dobInThePast = dobIsValid ? dateOfBirth.isBefore(moment(), 'day') : false
    const dobIsTooEarly = dobIsValid ? dateOfBirth.isBefore(moment({ day: 1, month: 0, year: 1900 })) : true

    if (!dobIsValid) {
      dobErrors.push({ text: 'Enter a date of birth which is a real date', href: '#dobDay' }, { href: '#dobError' })
    }

    if (dobIsValid && !dobInThePast) {
      dobErrors.push({ text: 'Enter a date of birth which is in the past', href: '#dobDay' }, { href: '#dobError' })
    }

    if (dobIsValid && dobIsTooEarly) {
      dobErrors.push({ text: 'Date of birth must be after 1900', href: '#dobDay' }, { href: '#dobError' })
    }
  }

  if (!dobDay && (dobMonth || dobYear)) {
    dobErrors.push({ text: 'Date of birth must include a day', href: '#dobDay' })
  }

  if (!dobMonth && (dobDay || dobYear)) {
    dobErrors.push({ text: 'Date of birth must include a month', href: '#dobMonth' })
  }

  if (!dobYear && (dobDay || dobMonth)) {
    dobErrors.push({ text: 'Date of birth must include a year', href: '#dobYear' })
  }

  return { dateOfBirth, dobErrors, dobIsValid }
}
