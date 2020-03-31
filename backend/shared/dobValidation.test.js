const dobValidation = require('./dobValidation')

describe('date of birth validation', () => {
  it('should error when missing the day', () => {
    expect(dobValidation(undefined, '3', '1987').dobErrors).toEqual([
      { href: '#dobDay', text: 'Date of birth must include a day' },
    ])
  })

  it('should error when missing the month', async () => {
    expect(dobValidation('13', undefined, '1987').dobErrors).toEqual([
      { text: 'Date of birth must include a month', href: '#dobMonth' },
    ])
  })

  it('should error when missing the year', async () => {
    expect(dobValidation('13', '3', undefined).dobErrors).toEqual([
      { text: 'Date of birth must include a year', href: '#dobYear' },
    ])
  })

  it('should error not a valid date', async () => {
    expect(dobValidation('32', '3', '1987').dobErrors).toEqual([
      { text: 'Enter a date of birth which is a real date', href: '#dobDay' },
      { href: '#dobError' },
    ])
  })

  it('should error when the date is in the future', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z

    expect(dobValidation('30', '3', '2019').dobErrors).toEqual([
      { text: 'Enter a date of birth which is in the past', href: '#dobDay' },
      { href: '#dobError' },
    ])

    Date.now.mockRestore()
  })

  it('should error when the date too far in the past', async () => {
    expect(dobValidation('13', '3', '1899').dobErrors).toEqual([
      { text: 'Date of birth must be after 1900', href: '#dobDay' },
      { href: '#dobError' },
    ])
  })
})
