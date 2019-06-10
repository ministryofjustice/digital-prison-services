import { iepChangeGaEvent, LevelSelected, ChangeAbandonment } from './IepChangeGaEvents'

describe('Bulk IEP level change ga events', () => {
  it('should create an ga event of type of level changed', () => {
    const level = 'Basic'
    const reason = 'Some reason'

    expect(LevelSelected(level, reason)).toEqual({
      ...iepChangeGaEvent,
      action: `level changed to ${level} with reason: ${reason}`,
    })
  })

  it('should create an ga event for cancelling of IEP level change', () => {
    expect(ChangeAbandonment()).toEqual({
      ...iepChangeGaEvent,
      action: `IEP level update abandoned`,
    })
  })
})
