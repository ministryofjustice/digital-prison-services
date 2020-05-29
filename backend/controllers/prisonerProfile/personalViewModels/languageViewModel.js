const getSecondaryLanguageLabel = lang => {
  const { canRead, canWrite, canSpeak } = lang

  if (canRead && canWrite && canSpeak) return null
  if (canRead && canWrite) return 'Reads and writes only'
  if (canRead && canSpeak) return 'Reads and speaks only'
  if (canWrite && canSpeak) return 'Writes and speaks only'
  if (canRead && !canWrite && !canSpeak) return 'Reads only'
  if (canWrite && !canRead && !canSpeak) return 'Writes only'
  if (canSpeak && !canWrite && !canRead) return 'Speaks only'

  return null
}

module.exports = ({ language, writtenLanguage, interpreterRequired, secondaryLanguages }) => {
  const writesDifferentToSpeaks = language !== writtenLanguage

  return {
    language,
    writtenLanguage,
    interpreterRequired,
    secondaryLanguages: secondaryLanguages.map(lang => ({
      key: { text: lang.description, classes: 'govuk-summary-list__key--indent' },
      value: { text: getSecondaryLanguageLabel(lang) },
    })),
  }
}
