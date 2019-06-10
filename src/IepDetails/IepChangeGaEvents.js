export const iepChangeGaEvent = {
  category: 'update IEP level',
  label: 'IEP change',
}

export const LevelSelected = (level, reason) => ({
  ...iepChangeGaEvent,
  action: `level changed to ${level} with reason: ${reason}`,
})

export const ChangeAbandonment = () => ({
  ...iepChangeGaEvent,
  action: `IEP level update abandoned`,
})
