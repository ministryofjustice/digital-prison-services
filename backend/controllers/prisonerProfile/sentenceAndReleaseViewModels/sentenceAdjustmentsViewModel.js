const OnlyValidValues = entry => Boolean(entry.value)

module.exports = sentenceAdjustments => {
  const {
    additionalDaysAwarded,
    unlawfullyAtLarge,
    recallSentenceRemand,
    recallSentenceTaggedBail,
    remand,
    restoredAdditionalDaysAwarded,
    specialRemission,
    taggedBail,
    unusedRemand,
  } = sentenceAdjustments || {}

  const daysRemovedFromSentence = [
    { label: 'Remand', value: remand },
    { label: 'Recall remand', value: recallSentenceRemand },
    { label: 'Recall tagged bail', value: recallSentenceTaggedBail },
    { label: 'Restored additional days awarded', value: restoredAdditionalDaysAwarded },
    { label: 'Special remission', value: specialRemission },
    { label: 'Tagged bail', value: taggedBail },
  ].filter(OnlyValidValues)

  const daysAddedToSentence = [
    { label: 'Additional days awarded', value: additionalDaysAwarded },
    { label: 'Unlawfully at large', value: unlawfullyAtLarge },
  ].filter(OnlyValidValues)

  const unusedRemandTime = [{ label: 'Unused remand time', value: unusedRemand }].filter(OnlyValidValues)

  const noSentenceAdjustments = Boolean(
    !daysAddedToSentence.length && !daysRemovedFromSentence.length && !unusedRemandTime.length
  )

  return {
    daysRemovedFromSentence,
    daysAddedToSentence,
    unusedRemandTime,
    noSentenceAdjustments,
  }
}
