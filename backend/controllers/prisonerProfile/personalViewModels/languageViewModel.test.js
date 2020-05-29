const languageViewModel = require('./languageViewModel')

const defaults = {
  interpreterRequired: false,
  language: '',
  writtenLanguage: '',
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
})
