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

module.exports = ({ language, writtenLanguage, interpreterRequired, secondaryLanguages = [] }) => {
  const speaksAndWritesSamePreferredLanguage = Boolean(language && writtenLanguage && language === writtenLanguage)
  const writesOnlyInPreferredLanguage = Boolean(writtenLanguage && !language)
  const speaksOnlyInPreferredLanguage = Boolean(language && !writtenLanguage)
  const noPreferredLanguageEntered = Boolean(!language && !writtenLanguage)
  const speaksAndWritesDifferentPreferredLanguages = Boolean(
    language && writtenLanguage && language !== writtenLanguage
  )

  return {
    language,
    writtenLanguage,
    interpreterRequired,
    speaksAndWritesSamePreferredLanguage,
    writesOnlyInPreferredLanguage,
    speaksOnlyInPreferredLanguage,
    noPreferredLanguageEntered,
    speaksAndWritesDifferentPreferredLanguages,
    secondaryLanguages:
      secondaryLanguages &&
      secondaryLanguages.map(lang => ({
        key: { text: lang.description, classes: 'govuk-summary-list__key--indent' },
        value: { text: getSecondaryLanguageLabel(lang) },
      })),
  }
}
