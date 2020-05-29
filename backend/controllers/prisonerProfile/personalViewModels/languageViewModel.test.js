const languageViewModel = require('./languageViewModel')

const defaults = {
  interpreterRequired: false,
  language: '',
  writtenLanguage: '',
  speaksAndWritesSamePreferredLanguage: false,
  writesOnlyInPreferredLanguage: false,
  noPreferredLanguageEntered: true,
  speaksAndWritesDifferentPreferredLanguages: false,
  speaksOnlyInPreferredLanguage: false,
}

const getEntryWith = (key, value) => ({
  key: {
    classes: 'govuk-summary-list__key--indent',
    text: key,
  },
  value: {
    text: value,
  },
})

describe('Language view model', () => {
  it('should return reads writes only', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: false, canRead: true, canWrite: true }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', 'Reads and writes only')],
    })
  })

  it('should return Reads and speaks only', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: true, canRead: true, canWrite: false }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', 'Reads and speaks only')],
    })
  })

  it('should return writes and speaks', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: true, canRead: false, canWrite: true }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', 'Writes and speaks only')],
    })
  })

  it('should return reads only', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: false, canRead: true, canWrite: false }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', 'Reads only')],
    })
  })

  it('should return writes only', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: false, canRead: false, canWrite: true }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', 'Writes only')],
    })
  })

  it('should return speaks only', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: true, canRead: false, canWrite: false }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', 'Speaks only')],
    })
  })

  it('should return when can speak, read and write', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: true, canRead: true, canWrite: true }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', null)],
    })
  })

  it('should return when can not speak, read and write', () => {
    const secondaryLanguages = [{ description: 'english', canSpeak: false, canRead: false, canWrite: false }]
    const model = languageViewModel({
      ...defaults,
      secondaryLanguages,
    })

    expect(model).toEqual({
      ...defaults,
      secondaryLanguages: [getEntryWith('english', null)],
    })
  })

  it('should return speaks and writes for preferred language', () => {
    const model = languageViewModel({ language: 'english', writtenLanguage: 'english' })

    expect(model).toEqual(
      expect.objectContaining({
        speaksAndWritesSamePreferredLanguage: true,
      })
    )
  })

  it('should return speaks and writes for different preferred languages', () => {
    const model = languageViewModel({ language: 'english', writtenLanguage: 'russian' })

    expect(model).toEqual(
      expect.objectContaining({
        speaksAndWritesDifferentPreferredLanguages: true,
      })
    )
  })

  it('should return writes only in preferred language', () => {
    const model = languageViewModel({ language: null, writtenLanguage: 'english' })

    expect(model).toEqual(
      expect.objectContaining({
        writesOnlyInPreferredLanguage: true,
      })
    )
  })

  it('should return speaks only in preferred language', () => {
    const model = languageViewModel({ language: 'english', writtenLanguage: null })

    expect(model).toEqual(
      expect.objectContaining({
        speaksOnlyInPreferredLanguage: true,
      })
    )
  })

  it('should return no preferred language entered', () => {
    const model = languageViewModel({ language: null, writtenLanguage: null })

    expect(model).toEqual(
      expect.objectContaining({
        noPreferredLanguageEntered: true,
      })
    )
  })
})
