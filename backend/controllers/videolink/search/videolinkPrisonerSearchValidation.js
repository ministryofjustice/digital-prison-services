const dobValidation = require('../../../shared/dobValidation')

module.exports = formValues => {
  const { firstName, lastName, prisonNumber, dobDay, dobMonth, dobYear } = formValues
  const { dobErrors } = dobValidation(dobDay, dobMonth, dobYear)
  const videolinkPrisonerSearchErrors = [...dobErrors]

  if (!lastName && !prisonNumber) {
    if (firstName) {
      videolinkPrisonerSearchErrors.push({ text: 'Enter a last name', href: '#lastName' })
    }

    if (!firstName) {
      videolinkPrisonerSearchErrors.push({
        text: "You must search using either the prisoner's last name or prison number",
        href: '#lastName',
      })
    }
  }

  if (prisonNumber) {
    if (prisonNumber.length !== 7) {
      videolinkPrisonerSearchErrors.push({
        text: 'Enter a prison number using 7 characters in the format A1234AA',
        href: '#prisonNumber',
      })
    }

    const startsWithLetter = /^[a-zA-Z]/

    if (!startsWithLetter.test(prisonNumber)) {
      videolinkPrisonerSearchErrors.push({
        text: 'Enter a prison number starting with a letter in the format A1234AA',
        href: '#prisonNumber',
      })
    }
  }

  return videolinkPrisonerSearchErrors
}
