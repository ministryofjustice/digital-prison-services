const ignoreNotFoundErrors = require('./ignoreNotFound')

describe('Ignore http NotFound errors telemetry processor', () => {
  it('should return false when a base type of RemoteDependencyData and resultCode equals 404', () => {
    expect(
      ignoreNotFoundErrors({
        data: {
          baseType: 'RemoteDependencyData',
          baseData: {
            resultCode: '404',
          },
        },
      })
    ).toBe(false)
  })

  it('should handle crappy data', () => {
    expect(ignoreNotFoundErrors()).toBe(true)
    expect(ignoreNotFoundErrors({ data: {} })).toBe(true)
    expect(ignoreNotFoundErrors({ data: { baseType: 'RemoteDependencyData' } })).toBe(true)
    expect(ignoreNotFoundErrors({ data: { baseType: 'RemoteDependencyData', baseData: {} } })).toBe(true)
  })
})
