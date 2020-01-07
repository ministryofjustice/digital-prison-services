export const iepChangeGaEvent = {
  category: 'update Incentive level',
  label: 'Incentive level change',
}

export const LevelSelected = (toLevel, fromLevel, agencyId) => ({
  ...iepChangeGaEvent,
  action: `level changed from ${fromLevel} to ${toLevel} at ${agencyId}`,
})

export const ChangeAbandonment = () => ({
  ...iepChangeGaEvent,
  action: `Incentive level update abandoned`,
})
