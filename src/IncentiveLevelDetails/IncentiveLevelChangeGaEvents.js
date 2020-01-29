export const iepChangeGaEvent = {
  category: 'update Incentive Level',
  label: 'Incentive Level change',
}

export const LevelSelected = (toLevel, fromLevel, agencyId) => ({
  ...iepChangeGaEvent,
  action: `level changed from ${fromLevel} to ${toLevel} at ${agencyId}`,
})

export const ChangeAbandonment = () => ({
  ...iepChangeGaEvent,
  action: `Incentive Level update abandoned`,
})
