import { iepChangeGaEvent, LevelSelected, ChangeAbandonment } from './IncentiveLevelChangeGaEvents'

describe('Bulk Incentive Level change ga events', () => {
  it('should create an ga event of type of level changed', () => {
    const toLevel = 'Basic'
    const fromLevel = 'Enhanced'
    const agencyId = 'LEI'

    expect(LevelSelected(toLevel, fromLevel, agencyId)).toEqual({
      ...iepChangeGaEvent,
      action: `level changed from ${fromLevel} to ${toLevel} at ${agencyId}`,
    })
  })

  it('should create an ga event for cancelling of Incentive Level change', () => {
    expect(ChangeAbandonment()).toEqual({
      ...iepChangeGaEvent,
      action: `Incentive Level update abandoned`,
    })
  })
})
