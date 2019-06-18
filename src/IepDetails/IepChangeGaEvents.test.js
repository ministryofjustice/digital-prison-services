import { iepChangeGaEvent, LevelSelected, ChangeAbandonment } from './IepChangeGaEvents'

describe('Bulk IEP level change ga events', () => {
  it('should create an ga event of type of level changed', () => {
    const toLevel = 'Basic'
    const fromLevel = 'Enhanced'
    const agencyId = 'LEI'

    expect(LevelSelected(toLevel, fromLevel, agencyId)).toEqual({
      ...iepChangeGaEvent,
      action: `level changed from ${fromLevel} to ${toLevel} at ${agencyId}`,
    })
  })

  it('should create an ga event for cancelling of IEP level change', () => {
    expect(ChangeAbandonment()).toEqual({
      ...iepChangeGaEvent,
      action: `IEP level update abandoned`,
    })
  })
})
