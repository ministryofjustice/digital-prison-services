const videolinkPrisonerSearchValidation = require('./videolinkPrisonerSearchValidation')

describe('prisoner search validation', () => {
  it('should error with no last name or prison number', async () => {
    expect(videolinkPrisonerSearchValidation({})).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name or prison number" },
    ])
  })

  it('should error when first name entered but no last name or prison number', async () => {
    expect(videolinkPrisonerSearchValidation({ firstName: 'Terry' })).toEqual([
      { text: 'Enter a last name', href: '#lastName' },
    ])
  })

  it('should error if prison number is not required length', async () => {
    expect(videolinkPrisonerSearchValidation({ prisonNumber: 'A1234A' })).toEqual([
      { text: 'Enter a prison number using 7 characters in the format A1234AA', href: '#prisonNumber' },
    ])
  })

  it('should error if prison number does not start with a letter', async () => {
    expect(videolinkPrisonerSearchValidation({ prisonNumber: '12345AA' })).toEqual([
      { text: 'Enter a prison number starting with a letter in the format A1234AA', href: '#prisonNumber' },
    ])
  })
})
