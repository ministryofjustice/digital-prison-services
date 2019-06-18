export const iepChangeGaEvent = {
  category: 'update IEP level',
  label: 'IEP change',
}

export const LevelSelected = (toLevel, fromLevel, agencyId) => ({
  ...iepChangeGaEvent,
  action: `level changed from ${fromLevel} to ${toLevel} at ${agencyId}`,
})

export const ChangeAbandonment = () => ({
  ...iepChangeGaEvent,
  action: `IEP level update abandoned`,
})
